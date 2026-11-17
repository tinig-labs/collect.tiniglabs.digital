"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { authCall, authClient } from "@/lib/auth/client";
import { updateProfile } from "@/lib/actions";
import { AGE, FIRST_LANG, GENDER, REGION } from "@/lib/profile-options";
import { Button, Field, Input, Select } from "@/components/ui";
import { PasswordInput } from "@/components/ui/password-input";
import { FormError } from "@/components/auth/auth-shell";

const Saved = ({ show, children = "Saved." }: { show: boolean; children?: string }) =>
  show ? (
    <p role="status" className="text-sm font-medium text-accent">
      {children}
    </p>
  ) : null;

export function NameForm({ name }: { name: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = String(new FormData(e.currentTarget).get("name")).trim();
    if (!next) return setError("Enter your name.");
    setPending(true);
    setError(null);
    setSaved(false);
    const { error } = await authCall(authClient.updateUser({ name: next }));
    setPending(false);
    if (error) return setError(error.message);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Name" hint="Never published.">
        <Input name="name" defaultValue={name} autoComplete="name" maxLength={120} required />
      </Field>
      <FormError message={error} />
      <Saved show={saved} />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Save name"}
      </Button>
    </form>
  );
}

type Details = {
  ageRange: string | null;
  gender: string | null;
  region: string | null;
  firstLanguage: string | null;
  profession: string | null;
};

export function DetailsForm({ details, showProfession }: { details: Details; showProfession: boolean }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const opts = (list: string[]) => [
    <option key="" value="">
      Prefer not to say
    </option>,
    ...list.map((v) => (
      <option key={v} value={v}>
        {v}
      </option>
    )),
  ];
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Age range">
          <Select name="ageRange" defaultValue={details.ageRange ?? ""}>{opts(AGE)}</Select>
        </Field>
        <Field label="Gender">
          <Select name="gender" defaultValue={details.gender ?? ""}>{opts(GENDER)}</Select>
        </Field>
        <Field label="Region">
          <Select name="region" defaultValue={details.region ?? ""}>{opts(REGION)}</Select>
        </Field>
        <Field label="First language">
          <Select name="firstLanguage" defaultValue={details.firstLanguage ?? ""}>{opts(FIRST_LANG)}</Select>
        </Field>
        {showProfession && (
          <Field label="Profession">
            <Input name="profession" defaultValue={details.profession ?? ""} placeholder="e.g. Speech-language pathologist" maxLength={120} />
          </Field>
        )}
      </div>
      <p className="text-xs leading-relaxed text-muted">
        These details are published with your recordings to describe the speaker. Changes apply to future releases.
      </p>
      <FormError message={state?.error ?? null} />
      <Saved show={!!state?.saved && !pending} />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Save details"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const newPassword = String(f.get("password"));
    if (newPassword !== String(f.get("confirm"))) return setError("Passwords do not match.");
    setPending(true);
    setError(null);
    setSaved(false);
    const { error } = await authCall(
      authClient.changePassword({
        currentPassword: String(f.get("current")),
        newPassword,
        revokeOtherSessions: f.get("signOutOthers") === "on",
      }),
    );
    setPending(false);
    if (error) return setError(error.message);
    setSaved(true);
    setFormKey((k) => k + 1); // clears the fields
  }

  return (
    <form key={formKey} onSubmit={onSubmit} className="space-y-4">
      <Field label="Current password">
        <PasswordInput name="current" autoComplete="current-password" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" hint="At least 8 characters.">
          <PasswordInput name="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirm new password">
          <PasswordInput name="confirm" autoComplete="new-password" minLength={8} required />
        </Field>
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" name="signOutOthers" defaultChecked className="size-4 accent-[var(--pandan)]" />
        Sign out on other devices
      </label>
      <FormError message={error} />
      <Saved show={saved}>Password changed.</Saved>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await authCall(authClient.signOut());
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
