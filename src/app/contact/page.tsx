import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { LEGAL_CONTACT } from "@/components/legal";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, beta access, reviewer access, or requests about your data.",
};

const NOTES = [
  { title: "Beta access", body: "Tell us a little about yourself and how you speak Tagalog. We send invite codes in small batches." },
  { title: "Speech professionals", body: "SLPs, linguists and phoneticians: include your profession and any affiliation for reviewer access." },
  { title: "Your data", body: "To have your recordings removed or your data corrected, write from the email on your account." },
];

export default async function Page({ searchParams }: PageProps<"/contact">) {
  const user = await getCurrentUser();
  const { topic } = await searchParams;
  return (
    <div className="pt-2 sm:pt-6">
      <h1 className="text-[clamp(2.25rem,10vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[3.25rem]">Contact</h1>
      <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
        Questions about the corpus, beta access, or your data. You can also email{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="font-medium text-accent underline underline-offset-4">{LEGAL_CONTACT}</a>.
      </p>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <ContactForm name={user?.name ?? ""} email={user?.email ?? ""} topic={typeof topic === "string" ? topic : "general"} />
        <aside className="space-y-6">
          {NOTES.map((n) => (
            <div key={n.title}>
              <h2 className="font-semibold">{n.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{n.body}</p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
