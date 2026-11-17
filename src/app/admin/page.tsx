import type { Metadata } from "next";
import { desc, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { createInvite, markContactHandled, revokeInvite } from "@/lib/actions";
import { CONTACT_TOPICS } from "@/lib/constants";
import { formatWhen } from "@/components/history";
import { Button, ButtonLink, Card, Field, Input, PageHeader, Select } from "@/components/ui";

export const metadata: Metadata = { title: "Admin" };

const isInactive = (i: typeof schema.inviteCodes.$inferSelect) =>
  i.uses >= i.maxUses || (!!i.expiresAt && i.expiresAt < new Date());

export default async function Page() {
  await requireUser({ roles: ["admin"] });

  const [counts, invites, inbox] = await Promise.all([
    db().execute<{ status: string; n: number }>(sql`SELECT status, count(*)::int AS n FROM recordings GROUP BY status`),
    db().select().from(schema.inviteCodes).orderBy(desc(schema.inviteCodes.createdAt)).limit(100),
    db().select().from(schema.contactMessages).where(isNull(schema.contactMessages.handledAt))
      .orderBy(desc(schema.contactMessages.createdAt)).limit(50),
  ]);
  const by = Object.fromEntries(counts.rows.map((r) => [r.status, r.n]));
  const tiles = [
    ["Awaiting model", by.pending_model ?? 0],
    ["Awaiting review", by.model_done ?? 0],
    ["Verified", by.reviewed ?? 0],
    ["Rejected", by.rejected ?? 0],
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader title="Admin">
        <ButtonLink href="/api/admin/export" variant="secondary" prefetch={false}>Export manifest (CSV)</ButtonLink>
      </PageHeader>

      <div className="grid grid-cols-2 gap-6 rounded-[28px] bg-card p-6 sm:grid-cols-4 sm:p-8">
        {tiles.map(([label, n]) => (
          <div key={label}>
            <div className="text-2xl font-semibold tabular-nums tracking-tight">{n.toLocaleString("en-US")}</div>
            <div className="mt-1 text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">
          Messages <span className="font-normal text-muted tabular-nums">({inbox.length} open)</span>
        </h2>
        {inbox.length === 0 ? (
          <p className="rounded-[28px] bg-card px-6 py-8 text-center text-sm text-muted">No open messages.</p>
        ) : (
          <ul className="space-y-3">
            {inbox.map((m) => (
              <li key={m.id} className="space-y-3 rounded-[28px] bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{m.name} <span className="font-normal text-muted">· {m.email}</span></p>
                    <p className="mt-0.5 text-xs text-muted">
                      {CONTACT_TOPICS[m.topic as keyof typeof CONTACT_TOPICS] ?? m.topic} · {formatWhen(m.createdAt)}
                      {m.userId ? " · signed in" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <ButtonLink
                      href={`mailto:${m.email}?subject=${encodeURIComponent("Re: tinig labs speech corpus")}`}
                      variant="secondary" className="h-9 rounded-full px-4" prefetch={false}
                    >
                      Reply
                    </ButtonLink>
                    <form action={markContactHandled}>
                      <input type="hidden" name="id" value={m.id} />
                      <Button variant="ghost" className="h-9 rounded-full px-4">Mark handled</Button>
                    </form>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text/85">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card className="space-y-4">
        <h2 className="font-medium">New invite code</h2>
        <form action={createInvite} className="grid gap-4 sm:grid-cols-2 sm:items-end lg:grid-cols-[1fr_9rem_8rem_8rem_auto]">
          <Field label="Note"><Input name="note" placeholder="Who it is for" /></Field>
          <Field label="Role">
            <Select name="role" defaultValue="reviewer">
              <option value="speaker">Beta tester</option>
              <option value="reviewer">Reviewer</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <Field label="Max uses"><Input name="maxUses" type="number" min={1} max={500} defaultValue={1} /></Field>
          <Field label="Expires (days)"><Input name="days" type="number" min={0} defaultValue={30} /></Field>
          <Button type="submit">Create</Button>
        </form>
      </Card>

      <div className="overflow-x-auto rounded-[28px] bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-muted">
            <tr>
              {["Code", "Role", "Uses", "Expires", "Note", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invites.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No invite codes yet.</td></tr>
            )}
            {invites.map((i) => {
              const expired = isInactive(i);
              return (
                <tr key={i.code} className={expired ? "text-muted" : ""}>
                  <td className="px-4 py-2.5 font-mono">{i.code}</td>
                  <td className="px-4 py-2.5 capitalize">{i.role === "speaker" ? "Beta tester" : i.role}</td>
                  <td className="px-4 py-2.5 tabular-nums">{i.uses} / {i.maxUses}</td>
                  <td className="px-4 py-2.5">{i.expiresAt ? i.expiresAt.toISOString().slice(0, 10) : "Never"}</td>
                  <td className="px-4 py-2.5">{i.note}</td>
                  <td className="px-4 py-2.5 text-right">
                    {!expired && (
                      <form action={revokeInvite}>
                        <input type="hidden" name="code" value={i.code} />
                        <button className="text-xs text-danger hover:underline">Revoke</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
