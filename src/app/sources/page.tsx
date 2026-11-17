import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sources & licenses" };
export const dynamic = "force-static";

const sources = [
  {
    name: "Tatoeba",
    href: "https://tatoeba.org",
    license: "CC BY 2.0 FR",
    licenseHref: "https://creativecommons.org/licenses/by/2.0/fr/",
    note: "Tagalog sentences. The contributor's username is kept with every prompt.",
  },
  {
    name: "Mozilla Common Voice",
    href: "https://github.com/common-voice/common-voice",
    license: "CC0 1.0",
    licenseHref: "https://creativecommons.org/publicdomain/zero/1.0/",
    note: "Tagalog sentences from the Common Voice sentence collector.",
  },
  {
    name: "Wiktionary (via kaikki.org)",
    href: "https://kaikki.org/dictionary/Tagalog/",
    license: "CC BY-SA 4.0",
    licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
    note: "Tagalog headwords. Proper nouns, affixes and inflected forms are excluded.",
  },
];

export default function Sources() {
  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sources &amp; licenses</h1>
        <p className="text-sm text-muted">
          Every prompt comes from an openly licensed corpus. None were written for this project. Source, ID, author
          and license are stored with each prompt and included in dataset exports.
        </p>
      </div>
      <div className="divide-y divide-border rounded-[28px] bg-card">
        {sources.map((s) => (
          <div key={s.name} className="grid gap-1 p-6 sm:grid-cols-[1fr_auto] sm:gap-6">
            <div>
              <a href={s.href} className="font-medium hover:underline">{s.name}</a>
              <p className="mt-1 text-sm text-muted">{s.note}</p>
            </div>
            <a href={s.licenseHref} className="text-sm text-muted hover:text-text sm:text-right">{s.license}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
