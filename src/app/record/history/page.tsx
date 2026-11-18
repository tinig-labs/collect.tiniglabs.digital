import type { Metadata } from "next";
import { NOINDEX } from "@/lib/constants";
import { notFound } from "next/navigation";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { audioUrl } from "@/lib/r2";
import { AudioPlayer } from "@/components/audio-player";
import { ButtonLink } from "@/components/ui";
import {
  Empty, HISTORY_PAGE_SIZE, HistoryHeader, HistoryItem, Ipa, Pager, Pill, formatWhen, pageFrom, totalPages,
} from "@/components/history";

export const metadata: Metadata = { title: "Your recordings", robots: NOINDEX };

type Row = {
  id: string; r2_key: string; duration_ms: number; status: "pending_model" | "model_done" | "reviewed" | "rejected";
  model_ipa: string | null; final_ipa: string | null; created_at: string; text: string; kind: string; total: number;
};

const STATUS = {
  pending_model: { tone: "wait", label: "Transcribing" },
  model_done: { tone: "info", label: "In review" },
  reviewed: { tone: "ok", label: "Verified" },
  rejected: { tone: "bad", label: "Not used" },
} as const;

export default async function Page({ searchParams }: PageProps<"/record/history">) {
  const user = await requireUser({ consent: true });
  const page = pageFrom((await searchParams).page);
  const res = await db().execute<Row>(sql`
    SELECT r.id, r.r2_key, r.duration_ms, r.status, r.model_ipa, r.final_ipa, r.created_at, p.text, p.kind,
           count(*) OVER ()::int AS total
    FROM recordings r JOIN prompts p ON p.id = r.prompt_id
    WHERE r.speaker_id = ${user.id}
    ORDER BY r.created_at DESC
    LIMIT ${HISTORY_PAGE_SIZE + 1} OFFSET ${(page - 1) * HISTORY_PAGE_SIZE}`);
  const rows = res.rows.slice(0, HISTORY_PAGE_SIZE);
  const total = res.rows[0]?.total ?? 0;
  const pages = totalPages(total);
  if (page > pages) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HistoryHeader title="Your recordings" back={{ href: "/record", label: "Back to recording" }} count={total} page={page} pages={pages} />
      {rows.length === 0 ? (
        <Empty>
          <p>No recordings yet.</p>
          <ButtonLink href="/record" className="mt-6">Start recording</ButtonLink>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <HistoryItem key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-medium leading-snug">{r.text}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatWhen(r.created_at)} · {(r.duration_ms / 1000).toFixed(1)} s · {r.kind}
                  </p>
                </div>
                <Pill tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Pill>
              </div>
              <AudioPlayer src={audioUrl(r.r2_key)} label="Recording" lazy />
              {(r.final_ipa || r.model_ipa) && (
                <Ipa label={r.final_ipa ? "Verified IPA" : "Model IPA (unverified)"} value={r.final_ipa ?? r.model_ipa} />
              )}
            </HistoryItem>
          ))}
        </ul>
      )}
      <Pager path="/record/history" page={page} pages={pages} />
    </div>
  );
}
