import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { canReview, requireUser } from "@/lib/session";
import { audioUrl } from "@/lib/r2";
import { AudioPlayer } from "@/components/audio-player";
import { ButtonLink } from "@/components/ui";
import {
  Empty, HISTORY_PAGE_SIZE, HistoryHeader, HistoryItem, Ipa, Pager, Pill, formatWhen, pageFrom, totalPages,
} from "@/components/history";

export const metadata: Metadata = { title: "Your reviews" };

type Row = {
  id: number; action: "approve" | "correct" | "bad_audio" | "skip"; ipa: string | null; created_at: string;
  r2_key: string; status: "pending_model" | "model_done" | "reviewed" | "rejected"; model_ipa: string | null;
  final_ipa: string | null; text: string; total: number;
};

const ACTION = {
  approve: { tone: "info", label: "Approved" },
  correct: { tone: "info", label: "Corrected" },
  bad_audio: { tone: "bad", label: "Flagged bad audio" },
  skip: { tone: "wait", label: "Skipped" },
} as const;

const OUTCOME = {
  pending_model: "Waiting for model",
  model_done: "Waiting for a second reviewer",
  reviewed: "Verified",
  rejected: "Rejected",
} as const;

export default async function Page({ searchParams }: PageProps<"/review/history">) {
  const user = await requireUser();
  if (!canReview(user.role)) redirect("/review");
  const page = pageFrom((await searchParams).page);
  const res = await db().execute<Row>(sql`
    SELECT rv.id, rv.action, rv.ipa, rv.created_at, r.r2_key, r.status, r.model_ipa, r.final_ipa, p.text,
           count(*) OVER ()::int AS total
    FROM reviews rv
    JOIN recordings r ON r.id = rv.recording_id
    JOIN prompts p ON p.id = r.prompt_id
    WHERE rv.reviewer_id = ${user.id} AND rv.action <> 'skip'
    ORDER BY rv.created_at DESC
    LIMIT ${HISTORY_PAGE_SIZE + 1} OFFSET ${(page - 1) * HISTORY_PAGE_SIZE}`);
  const rows = res.rows.slice(0, HISTORY_PAGE_SIZE);
  const total = res.rows[0]?.total ?? 0;
  const pages = totalPages(total);
  if (page > pages) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HistoryHeader title="Your reviews" back={{ href: "/review", label: "Back to reviewing" }} count={total} page={page} pages={pages} />
      {rows.length === 0 ? (
        <Empty>
          <p>No reviews yet.</p>
          <ButtonLink href="/review" className="mt-6">Start reviewing</ButtonLink>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const agreed = r.status === "reviewed" && r.final_ipa && r.ipa && r.final_ipa === r.ipa;
            return (
              <HistoryItem key={r.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-medium leading-snug">{r.text}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatWhen(r.created_at)} · {OUTCOME[r.status]}
                      {r.status === "reviewed" && r.ipa ? (agreed ? " · matches the final IPA" : " · final IPA differs") : ""}
                    </p>
                  </div>
                  <Pill tone={ACTION[r.action].tone}>{ACTION[r.action].label}</Pill>
                </div>
                <AudioPlayer src={audioUrl(r.r2_key)} label="Clip" lazy />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Ipa label="Your IPA" value={r.ipa} />
                  <Ipa label={r.final_ipa ? "Final IPA" : "Model IPA"} value={r.final_ipa ?? r.model_ipa} />
                </div>
              </HistoryItem>
            );
          })}
        </ul>
      )}
      <Pager path="/review/history" page={page} pages={pages} />
    </div>
  );
}
