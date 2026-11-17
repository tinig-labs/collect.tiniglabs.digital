import "server-only";
import { unstable_cache } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/** Aggregate counts, cached for an hour so the public pages never hit Postgres per visit. */
export const getStats = unstable_cache(
  async () => {
    const [row] = (
      await db().execute<{ prompts: number; recordings: number; speakers: number; verified: number; minutes: number }>(sql`
        SELECT
          (SELECT count(*) FROM prompts WHERE active)::int AS prompts,
          (SELECT count(*) FROM recordings WHERE status <> 'rejected')::int AS recordings,
          (SELECT count(DISTINCT speaker_id) FROM recordings)::int AS speakers,
          (SELECT count(*) FROM recordings WHERE status = 'reviewed')::int AS verified,
          (SELECT coalesce(sum(duration_ms), 0) / 60000 FROM recordings WHERE status <> 'rejected')::int AS minutes`)
    ).rows;
    return row;
  },
  ["stats"],
  { revalidate: 3600, tags: ["stats"] },
);
