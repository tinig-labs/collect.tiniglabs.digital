import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found" };

// Matches the 404 on tiniglabs.digital.
export default function NotFound() {
  return (
    <div className="pt-4 sm:pt-10 lg:pt-16">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-4 max-w-[16ch] text-[2.5rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[3.25rem]">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-muted">
        The link may be broken, or the page may have moved.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/" className="h-14 px-7 text-base">Go to the home page</ButtonLink>
        <ButtonLink href="/record" variant="secondary" className="h-14 px-7 text-base">Record</ButtonLink>
      </div>
    </div>
  );
}
