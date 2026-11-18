import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";
import { CLOSED_BETA, SITE_URL } from "@/lib/constants";
import { ORGANIZATION, jsonLd, publicPage } from "@/lib/seo";
import { getStats } from "@/lib/stats";

export const revalidate = 3600;

const description =
  "Record Tagalog words and sentences for an open speech dataset. Speech professionals verify every IPA transcription.";

export const metadata: Metadata = publicPage({ description, path: "/" });

const DATASET_JSON_LD = {
  "@type": "Dataset",
  name: "tinig labs Tagalog Speech Corpus",
  description:
    "An open corpus of Tagalog speech recordings. Speech professionals verify the IPA transcription of each clip.",
  url: `${SITE_URL}/`,
  inLanguage: "tl",
  isAccessibleForFree: true,
  license: "https://creativecommons.org/publicdomain/zero/1.0/",
  keywords: ["Tagalog", "Filipino", "speech", "IPA", "phonetic transcription", "speech therapy"],
  creator: ORGANIZATION,
  publisher: { "@id": ORGANIZATION["@id"] },
  creativeWorkStatus: "In progress",
};

async function safeStats() {
  try {
    return await getStats();
  } catch {
    return null;
  }
}

export default async function Home() {
  const s = await safeStats();
  const fmt = (n?: number) => (n === undefined ? "—" : n.toLocaleString("en-US"));
  const stats = [
    ["Recordings", fmt(s?.recordings)],
    ["Speakers", fmt(s?.speakers)],
    ["Minutes of speech", fmt(s?.minutes)],
    ["IPA verified", fmt(s?.verified)],
  ];

  return (
    <div className="space-y-20 sm:space-y-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(DATASET_JSON_LD)} />
      <section className="max-w-3xl pt-4 sm:pt-10">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-accent">
          Open Tagalog speech corpus
          {CLOSED_BETA && <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">Closed beta</span>}
        </p>
        <h1 className="mt-4 max-w-[16ch] text-balance text-[clamp(2.5rem,11vw,3rem)] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[4.5rem]">
          Lend your voice to Tagalog speech AI.
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted sm:mt-8">
          Read short sentences and words aloud. Speech professionals verify the phonetic transcriptions.
        </p>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <ButtonLink href="/record" className="h-14 px-7 text-base">Start recording</ButtonLink>
          {CLOSED_BETA ? (
            <ButtonLink href="/contact?topic=beta" variant="secondary" className="h-14 px-7 text-base">Request beta access</ButtonLink>
          ) : (
            <ButtonLink href="/review" variant="secondary" className="h-14 px-7 text-base">Review transcriptions</ButtonLink>
          )}
        </div>
        {CLOSED_BETA && (
          <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-muted">
            Contributing is invite-only while we test. Have a code? Create an account and enter it during onboarding.
          </p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-6 rounded-[28px] bg-card p-6 sm:p-10 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <div className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">{value}</div>
            <div className="mt-1 text-sm font-medium text-muted">{label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] bg-card p-6 sm:p-10">
          <p className="text-sm font-medium text-accent">Speakers</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Record in a few minutes</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Create an account, give consent, and read prompts in a quiet room. Each clip takes a few seconds.
          </p>
        </div>
        <div className="rounded-[28px] bg-surface p-6 sm:p-10">
          <p className="text-sm font-medium text-accent">SLPs and linguists</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Verify the IPA</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Join with an invite code. Approve or correct model transcriptions with the on-screen IPA keyboard.
          </p>
        </div>
      </section>
    </div>
  );
}
