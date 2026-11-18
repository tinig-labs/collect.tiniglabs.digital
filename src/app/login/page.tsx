import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { NOINDEX } from "@/lib/constants";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Sign in", robots: NOINDEX };

export default function Page() {
  return (
    <AuthShell
      title="Sign in"
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="font-semibold text-accent underline-offset-4 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
