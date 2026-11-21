"use client";

import { useActionState } from "react";
import Link from "next/link";
import { completeOnboarding } from "@/lib/actions";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { FormError } from "@/components/auth/auth-shell";
import type { Role } from "@/db/schema";
import { CLOSED_BETA } from "@/lib/constants";
import { AGE, FIRST_LANG, GENDER, REGION } from "@/lib/profile-options";


export function OnboardingForm({ invite, role }: { invite: string; role: Role }) {
  const [state, action, pending] = useActionState(completeOnboarding, undefined);
  const opts = (list: string[]) => [
    <option key="" value="">Prefer not to say</option>,
    ...list.map((v) => <option key={v} value={v}>{v}</option>),
  ];

  return (
    <form action={action} className="space-y-6">
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Consent</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Your recordings and the details below will be released in a public dataset.</li>
          <li>Your name and email are never published.</li>
          <li>You can ask for your recordings to be removed at any time.</li>
        </ul>
        <label className="flex cursor-pointer items-start gap-3 rounded-md bg-surface p-4 text-sm leading-relaxed">
          <input type="checkbox" name="consent" required className="mt-0.5 size-5 shrink-0 accent-[var(--pandan)]" />
          <span>
            I am 18 or older, agree to release my recordings under CC0, and accept the{" "}
            <Link href="/terms" target="_blank" className="font-medium text-accent underline underline-offset-4">Terms</Link> and{" "}
            <Link href="/privacy" target="_blank" className="font-medium text-accent underline underline-offset-4">Privacy Policy</Link>.
          </span>
        </label>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">About you <span className="font-normal text-muted">(optional)</span></h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Age range"><Select name="ageRange">{opts(AGE)}</Select></Field>
          <Field label="Gender"><Select name="gender">{opts(GENDER)}</Select></Field>
          <Field label="Region"><Select name="region">{opts(REGION)}</Select></Field>
          <Field label="First language"><Select name="firstLanguage">{opts(FIRST_LANG)}</Select></Field>
        </div>
      </Card>

      {(CLOSED_BETA || invite || role !== "speaker") && (
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{CLOSED_BETA ? "Beta access" : "Professional access"}</h2>
            {CLOSED_BETA && role === "speaker" && (
              <p className="mt-1 text-sm text-muted">
                The corpus is in closed beta. Enter the invite code you received.{" "}
                <Link href="/contact" className="font-medium text-accent underline underline-offset-4">Request a code</Link>
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Invite code">
              <Input name="invite" defaultValue={invite} autoComplete="off" required={CLOSED_BETA && role === "speaker"} />
            </Field>
            <Field label="Profession" hint="Only if you are a speech professional.">
              <Input name="profession" placeholder="e.g. Speech-language pathologist" />
            </Field>
          </div>
        </Card>
      )}

      <FormError message={state?.error ?? null} />
      <Button type="submit" disabled={pending} className="h-12 w-full px-7 sm:w-auto">{pending ? "Saving…" : "Continue"}</Button>
    </form>
  );
}
