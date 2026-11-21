"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authCall, authClient, isUnverified } from "@/lib/auth/client";
import Link from "next/link";
import { Button, Field, Input } from "@/components/ui";
import { PasswordInput } from "@/components/ui/password-input";
import { FormError, safeNext } from "./auth-shell";
import { CLOSED_BETA } from "@/lib/constants";
import { Turnstile, resetTurnstile, turnstileToken } from "@/components/turnstile";

const MIN_PASSWORD = 8;
const mismatch = (f: FormData) => String(f.get("password")) !== String(f.get("confirm"));

const verifyUrl = (email: string, next: string) =>
  `/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next")) ?? "/record";
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authCall(authClient.signIn.email({ email, password: String(f.get("password")) }));
    setPending(false);
    if (error) {
      if (isUnverified(error)) return router.push(verifyUrl(email, next));
      return setError(error.message ?? "Sign in failed.");
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {params.get("reset") === "1" && (
        <p role="status" className="rounded-md bg-surface px-4 py-3 text-sm text-text">
          Password updated. Sign in with your new password.
        </p>
      )}
      <Field label="Email">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      <div className="space-y-2">
        <Field label="Password">
          <PasswordInput name="password" autoComplete="current-password" required />
        </Field>
        <div className="text-right">
          <Link
            href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const invite = String(f.get("invite") ?? "").trim();
    if (mismatch(f)) return setError("Passwords do not match.");
    const form = e.currentTarget;
    setPending(true);
    setError(null);
    const { data, error } = await authCall(
      authClient.signUp.email({
        name: String(f.get("name")),
        email,
        password: String(f.get("password")),
        fetchOptions: { headers: { "x-turnstile-token": turnstileToken(form) } },
      }),
    );
    setPending(false);
    resetTurnstile(form); // tokens are single use
    if (error) return setError(error.message);

    // The invite code is redeemed on the onboarding page, once the user has a session.
    const next = `/onboarding${invite ? `?invite=${encodeURIComponent(invite)}` : ""}`;
    if (data?.user && !data.user.emailVerified && !data.token) return router.push(verifyUrl(email, next));
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Name">
        <Input name="name" autoComplete="name" required />
      </Field>
      <Field label="Email">
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" hint={`At least ${MIN_PASSWORD} characters.`}>
        <PasswordInput name="password" autoComplete="new-password" minLength={MIN_PASSWORD} required />
      </Field>
      <Field label="Confirm password">
        <PasswordInput name="confirm" autoComplete="new-password" minLength={MIN_PASSWORD} required />
      </Field>
      <Field label="Invite code" hint={CLOSED_BETA ? "Required during the closed beta." : "Only for invited speech professionals."}>
        <Input name="invite" defaultValue={params.get("invite") ?? ""} autoComplete="off" required={CLOSED_BETA} />
      </Field>
      <Turnstile />
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

export function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const next = safeNext(params.get("next")) ?? "/onboarding";
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const otp = String(new FormData(e.currentTarget).get("otp")).trim();
    setPending(true);
    setError(null);
    const { error } = await authCall(authClient.emailOtp.verifyEmail({ email, otp }));
    setPending(false);
    if (error) return setError(error.message ?? "Invalid code.");
    // Neon Auth signs the user in after verification; protected pages fall back to /login if not.
    router.push(next);
    router.refresh();
  }

  async function resend() {
    setError(null);
    setInfo(null);
    const { error } = await authCall(authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" }));
    if (error) setError(error.message ?? "Could not send a new code.");
    else setInfo("A new code was sent.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        Enter the code sent to <span className="text-text">{email}</span>.
      </p>
      <Field label="Verification code">
        <Input name="otp" inputMode="numeric" autoComplete="one-time-code" required />
      </Field>
      <FormError message={error} />
      {info && <p className="text-sm text-muted">{info}</p>}
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          Verify
        </Button>
        <Button type="button" variant="secondary" onClick={resend}>
          Resend
        </Button>
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function sendCode() {
    setPending(true);
    setError(null);
    setInfo(null);
    const { error } = await authCall(authClient.emailOtp.requestPasswordReset({ email }));
    setPending(false);
    if (error) return setError(error.message ?? "Could not send a code.");
    setSent(true);
    setInfo(`If an account exists for ${email}, a code is on its way.`);
  }

  async function onRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await sendCode();
  }

  async function onReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (mismatch(f)) return setError("Passwords do not match.");
    setPending(true);
    setError(null);
    const { error } = await authCall(
      authClient.emailOtp.resetPassword({
        email,
        otp: String(f.get("otp")).trim(),
        password: String(f.get("password")),
      }),
    );
    setPending(false);
    if (error) return setError(error.message ?? "Could not reset the password.");
    router.push(`/login?reset=1&email=${encodeURIComponent(email)}`);
  }

  if (!sent)
    return (
      <form key="request" onSubmit={onRequest} className="space-y-4">
        <p className="text-sm text-muted">Enter your account email and we will send you a reset code.</p>
        <Field label="Email">
          <Input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send reset code"}
        </Button>
      </form>
    );

  return (
    <form key="reset" onSubmit={onReset} className="space-y-4">
      {info && (
        <p role="status" className="text-sm text-muted">
          {info}
        </p>
      )}
      <Field label="Reset code">
        <Input name="otp" inputMode="numeric" autoComplete="one-time-code" required />
      </Field>
      <Field label="New password" hint={`At least ${MIN_PASSWORD} characters.`}>
        <PasswordInput name="password" autoComplete="new-password" minLength={MIN_PASSWORD} required />
      </Field>
      <Field label="Confirm new password">
        <PasswordInput name="confirm" autoComplete="new-password" minLength={MIN_PASSWORD} required />
      </Field>
      <FormError message={error} />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Saving…" : "Set new password"}
        </Button>
        <Button type="button" variant="secondary" onClick={sendCode} disabled={pending}>
          Resend
        </Button>
      </div>
    </form>
  );
}
