import Link from "next/link";
import type { ReactNode } from "react";

export const HISTORY_PAGE_SIZE = 20;

const when = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });
export const formatWhen = (d: Date | string) => when.format(new Date(d));

export const pageFrom = (raw: string | string[] | undefined) => {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n > 1 ? n : 1;
};

type Tone = "ok" | "info" | "wait" | "bad";
const TONES: Record<Tone, string> = {
  ok: "bg-accent text-accent-fg",
  info: "bg-surface text-accent",
  wait: "bg-text/5 text-muted",
  bad: "bg-[#fbeef1] text-danger",
};

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${TONES[tone]}`}>{children}</span>;
}

export function HistoryHeader({ title, back, count, page, pages }: { title: string; back: { href: string; label: string }; count: number; page: number; pages: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Link href={back.href} className="text-sm font-medium text-accent underline-offset-4 hover:underline">
          ← {back.label}
        </Link>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">{title}</h1>
      </div>
      <span className="text-sm font-medium text-muted tabular-nums">
        {count.toLocaleString("en-PH")} total{pages > 1 ? ` · page ${page} of ${pages}` : ""}
      </span>
    </div>
  );
}

export function HistoryItem({ children }: { children: ReactNode }) {
  return <li className="space-y-4 rounded-lg bg-card ring-1 ring-inset ring-border p-5 sm:p-6">{children}</li>;
}

export function Ipa({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 break-words font-ipa text-lg leading-snug">{value || <span className="font-sans text-sm text-muted">—</span>}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg bg-card ring-1 ring-inset ring-border px-6 py-16 text-center text-muted">{children}</div>;
}

/** Page numbers to show: always first and last, the current page and its neighbours, gaps as null. */
function pageList(page: number, total: number): (number | null)[] {
  const keep = new Set([1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push(n - sorted[i - 1] === 2 ? n - 1 : null);
    out.push(n);
  });
  return out;
}

export const totalPages = (count: number) => Math.max(1, Math.ceil(count / HISTORY_PAGE_SIZE));

export function Pager({ path, page, pages }: { path: string; page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? path : `${path}?page=${n}`);
  const cell = "inline-flex h-10 min-w-10 items-center justify-center rounded-sm px-3 text-sm font-semibold tabular-nums";
  const idle = `${cell} text-text/70 hover:bg-surface hover:text-text`;
  const edge = `${cell} gap-1 bg-card ring-1 ring-inset ring-border hover:bg-surface`;
  const off = `${cell} gap-1 text-text/30`;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-card p-2">
      {page > 1 ? (
        <Link className={edge} href={href(page - 1)} rel="prev">← Newer</Link>
      ) : (
        <span className={off} aria-hidden="true">← Newer</span>
      )}
      <ol className="flex flex-wrap items-center gap-1">
        {pageList(page, pages).map((n, i) =>
          n === null ? (
            <li key={`gap-${i}`} className="px-1 text-sm text-muted" aria-hidden="true">…</li>
          ) : (
            <li key={n}>
              {n === page ? (
                <span aria-current="page" className={`${cell} bg-accent text-accent-fg`}>{n}</span>
              ) : (
                <Link className={idle} href={href(n)} aria-label={`Page ${n}`}>{n}</Link>
              )}
            </li>
          ),
        )}
      </ol>
      {page < pages ? (
        <Link className={edge} href={href(page + 1)} rel="next">Older →</Link>
      ) : (
        <span className={off} aria-hidden="true">Older →</span>
      )}
    </nav>
  );
}
