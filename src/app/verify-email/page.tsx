import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Verify email" };

export default function Page() {
  return (
    <AuthShell title="Verify your email">
      <Suspense>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}
