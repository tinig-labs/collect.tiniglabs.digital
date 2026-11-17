import { sql } from "drizzle-orm";
import { db } from "@/db";
import { apiUser } from "@/lib/session";
import { audioUrl } from "@/lib/r2";
import { REVIEW_BATCH } from "@/lib/constants";

export type ReviewItem = { id: string; audioUrl: string; text: string; kind: string; modelIpa: string };

export async function GET() {
  const { user, error } = await apiUser(["reviewer", "admin"]);
  if (error) return error;

  // Items with fewer reviews first so each clip reaches agreement quickly; never one the reviewer has seen.
  const { rows } = await db().execute<{ id: string; key: string; text: string; kind: string; model_ipa: string }>(sql`
    SELECT r.id, r.r2_key AS key, p.text, p.kind, r.model_ipa
    FROM recordings r JOIN prompts p ON p.id = r.prompt_id
    WHERE r.status = 'model_done' AND r.speaker_id <> ${user.id}
      AND NOT EXISTS (SELECT 1 FROM reviews v WHERE v.recording_id = r.id AND v.reviewer_id = ${user.id})
    ORDER BY r.review_count DESC, r.created_at
    LIMIT ${REVIEW_BATCH}`);

  const items: ReviewItem[] = rows.map((r) => ({
    id: r.id, audioUrl: audioUrl(r.key), text: r.text, kind: r.kind, modelIpa: r.model_ipa ?? "",
  }));
  return Response.json({ items }, { headers: { "cache-control": "private, no-store" } });
}
