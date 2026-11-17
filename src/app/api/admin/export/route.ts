import { sql } from "drizzle-orm";
import { db } from "@/db";
import { apiUser } from "@/lib/session";
import { audioUrl } from "@/lib/r2";

const PAGE = 5000;
const csv = (v: unknown) => {
  let s = v == null ? "" : String(v);
  // Spreadsheet formula injection: a cell starting with = + - @ (or tab/CR) would run as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

type Row = {
  id: string; key: string; duration_ms: number; sample_rate: number; status: string;
  model_ipa: string | null; final_ipa: string | null; text: string; kind: string; source: string;
  source_id: string | null; source_author: string | null; license: string; speaker: string;
  age_range: string | null; gender: string | null; region: string | null; first_language: string | null;
};

// Streams the dataset manifest page by page (keyset pagination) so memory stays flat.
export async function GET() {
  const { error } = await apiUser(["admin"]);
  if (error) return error;

  const header = [
    "recording_id", "audio_url", "duration_ms", "sample_rate", "status", "model_ipa", "final_ipa",
    "prompt", "prompt_kind", "prompt_source", "prompt_source_id", "prompt_author", "prompt_license",
    "speaker_hash", "age_range", "gender", "region", "first_language",
  ];
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(enc.encode(header.join(",") + "\n"));
      let after = "00000000-0000-0000-0000-000000000000";
      for (;;) {
        const { rows } = await db().execute<Row>(sql`
          SELECT r.id, r.r2_key AS key, r.duration_ms, r.sample_rate, r.status, r.model_ipa, r.final_ipa,
                 p.text, p.kind, p.source, p.source_id, p.source_author, p.license,
                 md5(r.speaker_id) AS speaker, pr.age_range, pr.gender, pr.region, pr.first_language
          FROM recordings r
          JOIN prompts p ON p.id = r.prompt_id
          LEFT JOIN profiles pr ON pr.user_id = r.speaker_id
          WHERE r.id > ${after}::uuid AND r.status <> 'rejected'
          ORDER BY r.id LIMIT ${PAGE}`);
        if (!rows.length) break;
        const chunk = rows
          .map((r) =>
            [
              r.id, audioUrl(r.key), r.duration_ms, r.sample_rate, r.status, r.model_ipa, r.final_ipa, r.text,
              r.kind, r.source, r.source_id, r.source_author, r.license, r.speaker, r.age_range, r.gender,
              r.region, r.first_language,
            ].map(csv).join(","),
          )
          .join("\n");
        controller.enqueue(enc.encode(chunk + "\n"));
        after = rows[rows.length - 1].id;
        if (rows.length < PAGE) break;
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="tagalog-speech-corpus-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
