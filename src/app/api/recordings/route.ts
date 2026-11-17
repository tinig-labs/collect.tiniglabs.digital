import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { apiUser } from "@/lib/session";
import { MAX_RECORDING_MS, MIN_RECORDING_MS, TARGET_SAMPLE_RATE } from "@/lib/constants";
import { verifyUpload } from "@/lib/upload-token";

type Body = { id: string; key: string; promptId: number; durationMs: number; token: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// Smallest valid clip: 44-byte header + MIN_RECORDING_MS of 16-bit mono PCM.
const MIN_BYTES = 44 + (MIN_RECORDING_MS / 1000) * TARGET_SAMPLE_RATE * 2;

export async function POST(req: Request) {
  const { user, error } = await apiUser();
  if (error) return error;
  if (!user.consented) return Response.json({ error: "Consent required" }, { status: 403 });

  const b = (await req.json()) as Body;
  if (
    !UUID.test(b.id) ||
    b.key !== `recordings/${b.id.slice(0, 2)}/${b.id}.wav` ||
    !Number.isInteger(b.promptId) ||
    !(b.durationMs >= MIN_RECORDING_MS && b.durationMs <= MAX_RECORDING_MS + 500)
  ) {
    return Response.json({ error: "Invalid recording" }, { status: 400 });
  }
  if (!(await verifyUpload(user.id, b.id, b.token))) {
    return Response.json({ error: "Upload not issued to this account" }, { status: 403 });
  }

  // Only accept rows whose audio actually landed in R2 (one cheap HEAD via the binding).
  const audio = (getCloudflareContext().env as unknown as { AUDIO: R2Bucket }).AUDIO;
  const obj = await audio.head(b.key);
  if (!obj || obj.size < MIN_BYTES) return Response.json({ error: "Upload not found" }, { status: 400 });
  const durationMs = Math.round(((obj.size - 44) / 2 / TARGET_SAMPLE_RATE) * 1000); // trust the file, not the client

  // Insert + counter bump in one statement (one round trip).
  const { rows } = await db().execute<{ id: string }>(sql`
    WITH ins AS (
      INSERT INTO recordings (id, prompt_id, speaker_id, r2_key, duration_ms, sample_rate)
      VALUES (${b.id}::uuid, ${b.promptId}, ${user.id}, ${b.key}, ${durationMs}, ${TARGET_SAMPLE_RATE})
      ON CONFLICT DO NOTHING
      RETURNING id, prompt_id
    )
    UPDATE prompts SET recordings_count = recordings_count + 1
    FROM ins WHERE prompts.id = ins.prompt_id
    RETURNING ins.id`);

  if (!rows.length) return Response.json({ error: "Already recorded" }, { status: 409 });
  return Response.json({ ok: true });
}
