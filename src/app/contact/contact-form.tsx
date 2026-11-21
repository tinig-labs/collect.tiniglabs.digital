"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContact } from "@/lib/actions";
import { CONTACT_TOPICS } from "@/lib/constants";
import { Button, Field, Input, Select } from "@/components/ui";
import { FormError } from "@/components/auth/auth-shell";
import { Turnstile, resetTurnstile } from "@/components/turnstile";

export function ContactForm({ name, email, topic }: { name: string; email: string; topic: string }) {
  const [state, action, pending] = useActionState(sendContact, undefined);
  const form = useRef<HTMLFormElement>(null);
  // A token is spent on every submit; get a fresh one after an error.
  useEffect(() => {
    if (state?.error) resetTurnstile(form.current);
  }, [state]);

  if (state?.sent) {
    return (
      <div role="status" className="rounded-lg bg-surface p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">Message sent.</h2>
        <p className="mt-3 leading-relaxed text-muted">Thank you. We usually reply within a few days, to the email you gave.</p>
      </div>
    );
  }

  return (
    <form ref={form} action={action} className="space-y-4 rounded-lg bg-card ring-1 ring-inset ring-border p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input name="name" autoComplete="name" defaultValue={name} required maxLength={120} />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" defaultValue={email} required maxLength={200} />
        </Field>
      </div>
      <Field label="Topic">
        <Select name="topic" defaultValue={topic in CONTACT_TOPICS ? topic : "general"}>
          {Object.entries(CONTACT_TOPICS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </Field>
      <Field label="Message">
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          className="w-full rounded-md bg-card px-4 py-3 text-base sm:text-[0.9375rem] leading-relaxed ring-1 ring-inset ring-[var(--tinta)]/15 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="How can we help?"
        />
      </Field>
      {/* Honeypot for bots; hidden from people and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Turnstile />
      <FormError message={state?.error ?? null} />
      <Button type="submit" disabled={pending} className="h-12 px-6">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
