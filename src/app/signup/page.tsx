import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/auth-forms";
import { CLOSED_BETA, NOINDEX } from "@/lib/constants";

export const metadata: Metadata = { title: "Create account", robots: NOINDEX };

export default function Page() {
  return (
    <AuthShell
      title="Create account"
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-accent underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {CLOSED_BETA && (
        <p className="rounded-2xl bg-surface px-4 py-3 text-sm leading-relaxed text-text">
          <span className="font-semibold">Closed beta.</span> You need an invite code to contribute.{" "}
          <Link href="/contact?topic=beta" className="font-semibold text-accent underline underline-offset-4">Request one</Link>
        </p>
      )}
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
