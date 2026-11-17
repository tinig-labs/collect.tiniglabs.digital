import { sql } from "drizzle-orm";
import { db } from "@/db";
import { apiUser } from "@/lib/session";
import { PROMPT_BATCH } from "@/lib/constants";

export type PromptItem = { id: number; text: string; kind: "sentence" | "word"; source: string };

// One indexed query returns a whole batch; the client queues it (~1 DB call per 20 recordings).
// Picks from the least-recorded tier starting at a random id, so it never sorts the whole table.
export async function GET(req: Request) {
  const { user, error } = await apiUser();
  if (error) return error;

  const k = new URL(req.url).searchParams.get("kind");
  const kf = k === "word" || k === "sentence" ? sql`AND kind = ${k}::prompt_kind` : sql``;

  const { rows } = await db().execute<PromptItem>(sql`
    WITH tier AS (SELECT min(recordings_count) AS c FROM prompts WHERE active ${kf}),
         start AS (SELECT floor(random() * (SELECT max(id) FROM prompts))::int AS id),
         candidates AS (
           SELECT id, text, kind, source, recordings_count, (id < (SELECT id FROM start)) AS wrapped
           FROM prompts
           WHERE active ${kf} AND recordings_count <= (SELECT c FROM tier) + 1
         )
    SELECT c.id, c.text, c.kind, c.source
    FROM candidates c
    WHERE NOT EXISTS (SELECT 1 FROM recordings r WHERE r.prompt_id = c.id AND r.speaker_id = ${user.id})
    ORDER BY c.recordings_count, c.wrapped, c.id
    LIMIT ${PROMPT_BATCH}`);

  return Response.json({ items: rows }, { headers: { "cache-control": "private, no-store" } });
}
