import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { NOINDEX } from "@/lib/constants";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Reset password", robots: NOINDEX };

export default function Page() {
  return (
    <AuthShell
      title="Reset password"
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-accent underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
