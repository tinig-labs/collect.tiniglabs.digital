import { sql } from "drizzle-orm";
import { db } from "@/db";
import { apiUser } from "@/lib/session";
import { REVIEWS_TO_FINALIZE } from "@/lib/constants";
import { deleteAudioLater, withinLimit } from "@/lib/limits";

type Body = { recordingId: string; action: "approve" | "correct" | "bad_audio" | "skip"; ipa?: string };
const ACTIONS = new Set(["approve", "correct", "bad_audio", "skip"]);

const normalizeIpa = (s: string) => s.normalize("NFD").replace(/\s+/g, " ").trim();

export async function POST(req: Request) {
  const { user, error } = await apiUser(["reviewer", "admin"]);
  if (error) return error;

  if (!(await withinLimit("UPLOAD_LIMITER", `review:${user.id}`))) {
    return Response.json({ error: "Too many reviews, slow down." }, { status: 429 });
  }

  const b = (await req.json()) as Body;
  if (!ACTIONS.has(b.action) || typeof b.recordingId !== "string") {
    return Response.json({ error: "Invalid review" }, { status: 400 });
  }
  const ipa = b.action === "approve" || b.action === "correct" ? normalizeIpa(b.ipa ?? "").slice(0, 500) : null;
  if ((b.action === "approve" || b.action === "correct") && !ipa) {
    return Response.json({ error: "IPA is required" }, { status: 400 });
  }

  // Insert the review and update the recording in one statement:
  //  - finalize when REVIEWS_TO_FINALIZE reviewers agree on the same IPA
  //  - reject when REVIEWS_TO_FINALIZE reviewers flag bad audio
  const { rows } = await db().execute<{ status: string; r2_key: string }>(sql`
    WITH ins AS (
      INSERT INTO reviews (recording_id, reviewer_id, action, ipa)
      SELECT ${b.recordingId}::uuid, ${user.id}, ${b.action}::review_action, ${ipa}
      -- never your own recording: the queue hides them, and a direct POST must not count either
      WHERE EXISTS (SELECT 1 FROM recordings WHERE id = ${b.recordingId}::uuid AND status = 'model_done'
                    AND speaker_id <> ${user.id})
      ON CONFLICT DO NOTHING
      RETURNING recording_id
    ),
    tally AS (
      SELECT v.ipa, count(*) + 1 AS n FROM reviews v
      WHERE v.recording_id = ${b.recordingId}::uuid AND v.action IN ('approve', 'correct') AND v.ipa = ${ipa}
      GROUP BY v.ipa
    ),
    bad AS (
      SELECT count(*) + ${b.action === "bad_audio" ? 1 : 0} AS n FROM reviews v
      WHERE v.recording_id = ${b.recordingId}::uuid AND v.action = 'bad_audio'
    )
    UPDATE recordings r SET
      review_count = r.review_count + ${b.action === "skip" ? 0 : 1},
      status = CASE
        WHEN (SELECT n FROM tally) >= ${REVIEWS_TO_FINALIZE} THEN 'reviewed'::recording_status
        WHEN (SELECT n FROM bad) >= ${REVIEWS_TO_FINALIZE} THEN 'rejected'::recording_status
        ELSE r.status END,
      final_ipa = CASE WHEN (SELECT n FROM tally) >= ${REVIEWS_TO_FINALIZE} THEN ${ipa} ELSE r.final_ipa END
    FROM ins WHERE r.id = ins.recording_id
    RETURNING r.status, r.r2_key`);

  if (!rows.length) return Response.json({ error: "Already reviewed or unavailable" }, { status: 409 });
  // Rejected clips leave the public CDN: they will never be released.
  if (rows[0].status === "rejected") deleteAudioLater(rows[0].r2_key);
  return Response.json({ status: rows[0].status });
}
