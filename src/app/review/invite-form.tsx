"use client";

import { useActionState } from "react";
import { redeemInvite } from "@/lib/actions";
import { Button, Field, Input } from "@/components/ui";
import { FormError } from "@/components/auth/auth-shell";

export function InviteForm() {
  const [state, action, pending] = useActionState(redeemInvite, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Invite code">
        <Input name="invite" required autoComplete="off" className="uppercase" />
      </Field>
      <Field label="Profession">
        <Input name="profession" placeholder="e.g. Speech-language pathologist" />
      </Field>
      <FormError message={state?.error ?? null} />
      <Button type="submit" disabled={pending}>{pending ? "Checking…" : "Continue"}</Button>
    </form>
  );
}
