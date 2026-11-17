import type { Metadata } from "next";
import { canReview, requireUser } from "@/lib/session";
import { ReviewSession } from "./review-session";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = { title: "Review" };

export default async function Page() {
  const user = await requireUser();
  if (!canReview(user.role)) {
    return (
      <div className="mx-auto max-w-md space-y-4 pt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Reviewer access</h1>
        <p className="text-sm text-muted">
          IPA review is open to invited speech-language pathologists, linguists and phoneticians. Enter your invite
          code to continue.
        </p>
        <InviteForm />
      </div>
    );
  }
  return <ReviewSession />;
}
