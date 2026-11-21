import type { Metadata } from "next";
import { NOINDEX } from "@/lib/constants";
import type { ReactNode } from "react";
import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { canReview, requireUser } from "@/lib/session";
import { ButtonLink } from "@/components/ui";
import { DetailsForm, NameForm, PasswordForm, SignOutButton } from "./account-forms";

export const metadata: Metadata = { title: "Account", robots: NOINDEX };

const ROLE = { speaker: "Speaker", reviewer: "Reviewer", admin: "Admin" } as const;

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 rounded-lg bg-card ring-1 ring-inset ring-border p-6 sm:p-8 md:grid-cols-[14rem_1fr] md:gap-10">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {hint && <p className="mt-1.5 text-sm leading-relaxed text-muted">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function Page() {
  const user = await requireUser();
  const [[profile], counts] = await Promise.all([
    db().select().from(schema.profiles).where(eq(schema.profiles.userId, user.id)).limit(1),
    db().execute<{ recordings: number; verified: number; reviews: number }>(sql`
      SELECT (SELECT count(*)::int FROM recordings WHERE speaker_id = ${user.id}) AS recordings,
             (SELECT count(*)::int FROM recordings WHERE speaker_id = ${user.id} AND status = 'reviewed') AS verified,
             (SELECT count(*)::int FROM reviews WHERE reviewer_id = ${user.id} AND action <> 'skip') AS reviews`),
  ]);
  const c = counts.rows[0] ?? { recordings: 0, verified: 0, reviews: 0 };
  const reviewer = canReview(user.role);
  const stats = [
    { label: "Recordings", value: c.recordings, href: "/record/history" },
    { label: "Verified", value: c.verified, href: "/record/history" },
    ...(reviewer ? [{ label: "Reviews", value: c.reviews, href: "/review/history" }] : []),
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-[-0.03em] sm:text-4xl">Account</h1>
          <p className="mt-2 text-sm text-muted">
            {user.email} · <span className="font-medium text-accent">{ROLE[user.role]}</span>
          </p>
        </div>
        <SignOutButton />
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-lg bg-card ring-1 ring-inset ring-border p-6 transition-colors hover:bg-surface">
            <div className="text-3xl font-semibold tabular-nums tracking-tight">{s.value.toLocaleString("en-PH")}</div>
            <div className="mt-1 text-sm font-medium text-muted">{s.label} →</div>
          </Link>
        ))}
      </section>

      <Section title="Profile" hint="Your name is only used to address you.">
        <NameForm name={user.name ?? ""} />
      </Section>

      <Section title="About you" hint="Optional. Helps researchers know who is speaking.">
        <DetailsForm
          showProfession={reviewer}
          details={{
            ageRange: profile?.ageRange ?? null,
            gender: profile?.gender ?? null,
            region: profile?.region ?? null,
            firstLanguage: profile?.firstLanguage ?? null,
            profession: profile?.profession ?? null,
          }}
        />
      </Section>

      <Section title="Password">
        <PasswordForm />
      </Section>

      <Section title="Your data" hint="Recordings are released under CC0. Removal applies to the corpus and future releases.">
        <div className="space-y-4 text-sm leading-relaxed text-text/85">
          <p>
            To remove your recordings, correct your data, or delete your account, send us a request. Write from{" "}
            <span className="font-medium">{user.email}</span> so we can confirm it&apos;s you.
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/contact?topic=data" variant="secondary">
              Request removal or a copy
            </ButtonLink>
            <ButtonLink href="/privacy" variant="ghost">
              Privacy Policy
            </ButtonLink>
          </div>
        </div>
      </Section>
    </div>
  );
}
