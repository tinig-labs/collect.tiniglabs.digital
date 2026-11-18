import { Suspense } from "react";
import type { Metadata } from "next";
import { NOINDEX } from "@/lib/constants";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Verify email", robots: NOINDEX };

export default function Page() {
  return (
    <AuthShell title="Verify your email">
      <Suspense>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}
