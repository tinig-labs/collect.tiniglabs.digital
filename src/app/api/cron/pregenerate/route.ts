import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { audioUrl } from "@/lib/r2";
import { transcribeBatch } from "@/lib/modal";
import { MODAL_BATCH, MODAL_MAX_ATTEMPTS } from "@/lib/constants";
import { deleteAudioLater } from "@/lib/limits";

// Called by the Worker cron trigger (worker.mjs). Runs PhoneticXeus on Modal in batches.
export async function POST(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Forbidden", { status: 403 });
  }

  const { recordings: r } = schema;
  const pending = await db()
    .select({ id: r.id, key: r.r2Key })
    .from(r)
    .where(eq(r.status, "pending_model"))
    .orderBy(asc(r.modelAttempts), asc(r.createdAt))
    .limit(MODAL_BATCH);
  if (pending.length === 0) return Response.json({ processed: 0 });

  // A failed call (Modal down, timeout) changes nothing: the same clips are picked up next run.
  let model: string, results: { id: string; ipa?: string; error?: string }[];
  try {
    ({ model, results } = await transcribeBatch(pending.map((p) => ({ id: p.id, audioUrl: audioUrl(p.key) }))));
  } catch (e) {
    console.error("pregenerate: Modal call failed", e);
    return Response.json({ processed: 0, error: String(e).slice(0, 300) }, { status: 502 });
  }

  const asked = new Set(pending.map((p) => p.id));
  const ok = results.filter((x): x is { id: string; ipa: string } => asked.has(x.id) && typeof x.ipa === "string" && x.ipa.length > 0);
  const failed = results.filter((x) => asked.has(x.id) && !ok.includes(x as { id: string; ipa: string }));

  if (ok.length) {
    const values = sql.join(ok.map((x) => sql`(${x.id}::uuid, ${x.ipa})`), sql`, `);
    await db().execute(sql`
      UPDATE recordings AS rec
      SET model_ipa = v.ipa, model_version = ${model}, model_error = NULL, status = 'model_done'
      FROM (VALUES ${values}) AS v(id, ipa)
      WHERE rec.id = v.id AND rec.status = 'pending_model'`);
  }

  // Per-clip failures are retried on later runs; after MODAL_MAX_ATTEMPTS the clip is rejected.
  if (failed.length) {
    const values = sql.join(failed.map((x) => sql`(${x.id}::uuid, ${(x.error ?? "no transcription").slice(0, 300)})`), sql`, `);
    const rejected = await db().execute<{ status: string; r2_key: string }>(sql`
      UPDATE recordings AS rec
      SET model_attempts = rec.model_attempts + 1,
          model_error = v.err,
          status = CASE WHEN rec.model_attempts + 1 >= ${MODAL_MAX_ATTEMPTS} THEN 'rejected'::recording_status
                        ELSE rec.status END
      FROM (VALUES ${values}) AS v(id, err)
      WHERE rec.id = v.id AND rec.status = 'pending_model'
      RETURNING rec.status, rec.r2_key`);
    for (const r of rejected.rows) if (r.status === "rejected") deleteAudioLater(r.r2_key);
  }

  return Response.json({ processed: ok.length, failed: failed.length, model });
}
