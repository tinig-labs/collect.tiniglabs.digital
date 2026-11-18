import type { Metadata } from "next";
import { NOINDEX } from "@/lib/constants";
import { requireUser } from "@/lib/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Before you start", robots: NOINDEX };

export default async function Page({ searchParams }: PageProps<"/onboarding">) {
  const user = await requireUser();
  const { invite } = await searchParams;
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Before you start</h1>
      <OnboardingForm invite={typeof invite === "string" ? invite : ""} role={user.role} />
    </div>
  );
}
