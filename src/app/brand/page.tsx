import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { publicPage } from "@/lib/seo";
import { Lockup, Mark, markSrc } from "@/components/brand";
import { A, List, P, Section } from "@/components/legal";
import { MAIN_SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

export const metadata: Metadata = publicPage({
  title: "Brand",
  description: "The tinig labs logo family, colours and type, and the speech corpus logo files to download.",
  path: "/brand",
});

const TOC = [
  { id: "family", label: "The logo family" },
  { id: "construction", label: "Construction" },
  { id: "lockups", label: "Lockups" },
  { id: "clear-space", label: "Clear space and size" },
  { id: "colour-versions", label: "Colour versions" },
  { id: "app-icons", label: "App icons" },
  { id: "colour", label: "Colour" },
  { id: "type", label: "Type" },
  { id: "donts", label: "Don'ts" },
  { id: "files", label: "Files" },
];

type MarkName = "corpus" | "tinig-labs" | "notebook";

const FAMILY: { name: MarkName; title: string; usedFor: ReactNode; says: string; here?: boolean }[] = [
  {
    name: "corpus",
    title: "Banig weave",
    usedFor: "speech corpus (collect.tiniglabs.digital)",
    says: "Rounded strands woven over and under like a banig mat: many voices woven into one dataset.",
    here: true,
  },
  {
    name: "tinig-labs",
    title: "Echo t",
    usedFor: "tinig labs, the lab",
    says: "A lowercase t on three rounded squares that fade back like an echo: a voice carrying.",
  },
  {
    name: "notebook",
    title: "Arch n",
    usedFor: "notebook (notebook.tiniglabs.digital)",
    says: "A lowercase n drawn in one stroke that fades from pandan into tinta.",
  },
];

const COLOURS = [
  { token: "gatas", hex: "#F9FBFA", meaning: "milk", use: "Page background. The ground every logo is shown on first.", dark: false },
  { token: "tinta", hex: "#13261F", meaning: "ink", use: "Text and the wordmark. The across strands of the weave.", dark: true },
  { token: "abo", hex: "#5F6F68", meaning: "grey", use: "Muted text and product names in lockups. 5.1:1 on gatas.", dark: true },
  { token: "pandan", hex: "#1F6B4F", meaning: "", use: "Brand green: tiles, the down strands of the weave, links. 6.2:1 on gatas.", dark: true },
  { token: "mint", hex: "#E2F3EA", meaning: "", use: "Soft tint: pills and highlight bands. Pandan text on mint is 5.6:1.", dark: false },
  { token: "dahon", hex: "#7FC8A4", meaning: "leaf", use: "Accent on pandan only: reversed marks and app icons. Never text on gatas (1.9:1).", dark: false },
];

const VERSIONS = [
  { key: "primary", label: "Primary", note: "On gatas, white or mint. The default.", grounds: ["bg-[var(--gatas)]", "bg-white", "bg-[var(--mint)]"] },
  { key: "reversed", label: "Reversed", note: "On pandan or tinta.", grounds: ["bg-[var(--pandan)]", "bg-[var(--tinta)]"] },
  { key: "mono-ink", label: "Mono ink", note: "One-colour printing, stamps, fax-style documents.", grounds: ["bg-white"] },
  { key: "mono-white", label: "Mono white", note: "Calm photos and dark one-colour printing.", grounds: ["bg-[var(--tinta)]"] },
] as const;

const GROUND_NAME: Record<string, string> = {
  "bg-[var(--gatas)]": "gatas",
  "bg-white": "white",
  "bg-[var(--mint)]": "mint",
  "bg-[var(--pandan)]": "pandan",
  "bg-[var(--tinta)]": "tinta",
};

const MARK_LABEL: Record<MarkName, string> = { corpus: "Banig weave", "tinig-labs": "Echo t", notebook: "Arch n" };
const FILE_PREFIX: Record<MarkName, string> = { corpus: "corpus", "tinig-labs": "tinig-labs", notebook: "notebook" };

const panel = "rounded-lg bg-card ring-1 ring-inset ring-border";
const dl = "font-medium text-accent underline underline-offset-4 rounded-sm";

function Img({ src, size, alt = "", className = "", style }: { src: string; size: number; alt?: string; className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element -- static brand files from /public
  return <img src={src} width={size} height={size} alt={alt} className={`block shrink-0 ${className}`} style={style} draggable={false} />;
}

/** The 120-unit grid with a mark laid on it, and the clear-space margin (30 units) dashed around it. */
function GridFigure({ name, caption }: { name: MarkName; caption: string }) {
  const lines = Array.from({ length: 13 }, (_, i) => i * 10);
  return (
    <figure className={`${panel} p-4 sm:p-6`}>
      <svg viewBox="-34 -34 188 188" className="mx-auto block w-full max-w-64" role="img" aria-label={`${MARK_LABEL[name]} on the 120-unit grid, with its clear space`}>
        <rect x="-30" y="-30" width="180" height="180" rx="8" fill="none" stroke="#1F6B4F" strokeWidth="0.8" strokeDasharray="3 3" />
        <rect x="0" y="0" width="120" height="120" fill="#E2F3EA" />
        {lines.map((v) => (
          <g key={v} stroke="#1F6B4F" strokeOpacity={v % 30 === 0 ? 0.35 : 0.15} strokeWidth="0.5">
            <line x1={v} y1="0" x2={v} y2="120" />
            <line x1="0" y1={v} x2="120" y2={v} />
          </g>
        ))}
        <image href={markSrc(name)} x="0" y="0" width="120" height="120" />
      </svg>
      <figcaption className="mt-4 text-sm leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}

function Swatch({ c }: { c: (typeof COLOURS)[number] }) {
  return (
    <li className={`${panel} overflow-hidden`}>
      <div className="flex h-24 items-end p-4" style={{ background: c.hex, boxShadow: "inset 0 -1px 0 rgb(19 38 31 / 0.1)" }}>
        <span className={`font-mono text-sm font-semibold ${c.dark ? "text-white" : "text-[var(--tinta)]"}`}>{c.hex}</span>
      </div>
      <div className="p-4">
        <p className="font-semibold">
          <code className="font-sans">{c.token}</code>
          {c.meaning && <span className="font-normal text-muted"> · {c.meaning}</span>}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{c.use}</p>
      </div>
    </li>
  );
}

function Dont({ children, label }: { children: ReactNode; label: string }) {
  return (
    <li className={`${panel} overflow-hidden`}>
      <div className="flex h-36 items-center justify-center" aria-hidden="true">
        {children}
      </div>
      <p className="flex items-start gap-2 border-t border-border px-4 py-3 text-sm leading-snug">
        <svg viewBox="0 0 16 16" width="16" height="16" className="mt-0.5 shrink-0 text-danger" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>
          <span className="font-semibold">Don&apos;t:</span> {label}
        </span>
      </p>
    </li>
  );
}

const FILES: { group: string; items: { label: string; file: string }[] }[] = (["corpus", "tinig-labs", "notebook"] as MarkName[]).map((n) => ({
  group: MARK_LABEL[n],
  items: [
    { label: "Primary", file: `${FILE_PREFIX[n]}-mark.svg` },
    { label: "Reversed", file: `${FILE_PREFIX[n]}-mark-reversed.svg` },
    { label: "Mono ink", file: `${FILE_PREFIX[n]}-mark-mono-ink.svg` },
    { label: "Mono white", file: `${FILE_PREFIX[n]}-mark-mono-white.svg` },
    { label: "App icon", file: `${FILE_PREFIX[n]}-app-icon.svg` },
    { label: "App icon 512", file: `${FILE_PREFIX[n]}-app-icon-512.png` },
    { label: "App icon 180", file: `${FILE_PREFIX[n]}-app-icon-180.png` },
    { label: "App icon 32", file: `${FILE_PREFIX[n]}-app-icon-32.png` },
  ],
}));

export default function BrandPage() {
  return (
    <div className="pt-2 sm:pt-6">
      <p className="text-sm font-semibold text-accent">Brand guide</p>
      <h1 className="mt-3 text-[clamp(2.25rem,10vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[3.25rem]">Brand</h1>
      <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">
        The speech corpus logo, the rest of the tinig labs family, and the colours and type that go with them. It
        matches <A href={MAIN_SITE_URL}>tiniglabs.digital</A>. The name is always lowercase: <strong className="font-semibold text-text">tinig labs</strong>, and
        so are product names: <strong className="font-semibold text-text">speech corpus</strong>, <strong className="font-semibold text-text">notebook</strong>.
      </p>

      {/* The corpus mark and lockup up front. */}
      <section aria-label="The speech corpus logo" className="mt-12 grid gap-4 md:grid-cols-[1fr_16rem]">
        <div className={`${panel} flex min-h-56 flex-col justify-between gap-8 p-6 sm:p-8`}>
          <p className="text-sm font-medium text-muted">Speech corpus lockup</p>
          <div className="overflow-x-auto py-2">
            <span className="hidden sm:inline-flex"><Lockup name="corpus" product="speech corpus" fontSize={36} /></span>
            <span className="inline-flex sm:hidden"><Lockup name="corpus" product="speech corpus" fontSize={22} /></span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="/brand/corpus-mark.svg" download className={dl}>Mark (SVG)</a>
            <a href="/brand/corpus-app-icon-512.png" download className={dl}>App icon (PNG)</a>
            <a href="/brand/tinig-labs-logos.zip" download className={dl}>All logo files (ZIP)</a>
          </div>
        </div>
        <div className="flex h-44 items-center justify-center rounded-lg bg-[var(--pandan)] md:aspect-square md:h-auto">
          <Img src={markSrc("corpus", "reversed")} size={128} alt="The Banig weave, reversed, on pandan" className="size-32" />
        </div>
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <nav aria-label="On this page" className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <p className="text-sm font-medium text-muted">On this page</p>
          <ol className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 lg:flex-col lg:gap-1">
            {TOC.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="block whitespace-nowrap rounded-full bg-card px-3.5 py-2 text-sm font-medium text-text/75 hover:bg-surface hover:text-text lg:rounded-sm lg:bg-transparent">
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 leading-relaxed text-text/85 [&>section>p]:max-w-[68ch] [&>section>ul]:max-w-[68ch]">
          <Section id="family" title="The logo family">
            <P>
              There are three marks, one for each part of tinig labs. They are drawn on the same 120-unit grid with
              rounded ends and corners, so they look like siblings.
            </P>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {FAMILY.map((m) => (
                <li key={m.name} className={`${panel} flex flex-col p-6`}>
                  <div className="flex items-start justify-between gap-3">
                    <Mark name={m.name} size={72} className="size-[72px]" />
                    {m.here && <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">This site</span>}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-text">{m.title}</h3>
                  <p className="mt-1 text-sm font-medium text-text">{m.usedFor}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{m.says}</p>
                </li>
              ))}
            </ul>
            <P>
              Use the Echo t whenever you&apos;re talking about tinig labs as a whole: the website header, social profiles,
              slides, emails. Use a product mark only inside, or about, that product. On this site the Banig weave
              leads, and the Echo t marks the links back to the lab.
            </P>
          </Section>

          <Section id="construction" title="Construction">
            <P>All three are drawn on a 120 × 120 grid. The dashed line shows the clear space around each.</P>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <GridFigure name="corpus" caption="Banig weave: three strands across in tinta and three down in pandan, 12 units wide and 26 apart." />
              <GridFigure name="tinig-labs" caption="Echo t: three 70-unit squares with a 24-unit corner, each offset 15 units down and right." />
              <GridFigure name="notebook" caption="Arch n: one 16-unit stroke with round ends and a 28-unit arch." />
            </div>
            <List>
              <li>
                <span className="font-medium text-text">Banig weave:</span> three strands across (tinta) and three down
                (pandan), 12 units wide and 26 units apart, with round ends. At each crossing they swap which one is on
                top, in a checker pattern. Where a strand passes under, it breaks with a 3.5-unit gap on each side. The
                gaps are transparent, so the weave works on any background.
              </li>
              <li>
                <span className="font-medium text-text">Echo t:</span> three 70-unit squares with a 24-unit corner radius,
                each one offset 15 units down and right. Front square tinta at full strength, middle pandan at 75%
                opacity, back dahon at 45%. The t is an 8-unit stroke with round ends, in gatas.
              </li>
              <li>
                <span className="font-medium text-text">Arch n:</span> one 16-unit stroke with round ends: a stem from y
                38 to 90 and an arch with a 28-unit radius. The gradient runs from pandan at the bottom left to tinta at
                the top right.
              </li>
            </List>
            <P>Never redraw the marks. Use the files below.</P>
          </Section>

          <Section id="lockups" title="Lockups">
            <P>A lockup is the mark next to the wordmark.</P>
            <div className={`${panel} mt-6 divide-y divide-border`}>
              {(
                [
                  ["corpus", "speech corpus", "This site"],
                  ["tinig-labs", undefined, "The lab"],
                  ["notebook", "notebook", "notebook"],
                ] as const
              ).map(([name, product, label]) => (
                <div key={name} className="flex flex-col gap-3 overflow-x-auto p-6 sm:flex-row sm:items-center sm:justify-between">
                  <Lockup name={name} product={product} fontSize={24} />
                  <span className="text-sm text-muted">{label}</span>
                </div>
              ))}
            </div>
            <List>
              <li>
                <span className="font-medium text-text">Wordmark:</span> &ldquo;tinig labs&rdquo; in Montserrat SemiBold
                (600), letter-spacing −0.02em, in tinta.
              </li>
              <li>
                <span className="font-medium text-text">Product lockups:</span> the product&apos;s mark, then &ldquo;tinig
                labs&rdquo; in Montserrat 600, then the product name in Figtree Medium (500) in abo, a little smaller
                (about 0.75× the wordmark size).
              </li>
              <li>
                <span className="font-medium text-text">Proportions:</span> make the mark about 1.75× the wordmark&apos;s
                font size, with a gap of about 0.55× the font size. On the website that&apos;s a 32 px mark, an 18 px
                wordmark and a 10 px gap.
              </li>
              <li>
                Always put the mark on the left. Don&apos;t stack the wordmark under the mark unless you have no room for
                the horizontal version.
              </li>
            </List>
            <div className={`${panel} mt-6 p-6`}>
              <p className="text-sm font-medium text-muted">At website size</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Lockup name="corpus" product="speech corpus" fontSize={18} />
                <span className="text-sm text-muted tabular-nums">32 px mark · 10 px gap · 18 px wordmark · 13.5 px product</span>
              </div>
            </div>
          </Section>

          <Section id="clear-space" title="Clear space and minimum size">
            <List>
              <li>
                <span className="font-medium text-text">Clear space:</span> keep at least a quarter of the mark&apos;s
                width empty on every side (30 units on the 120 grid). Nothing else goes inside that space: text, edges
                or other logos.
              </li>
              <li>
                <span className="font-medium text-text">Minimum size:</span> 24 px for the Echo t and the Banig weave,
                20 px for the Arch n. Below that, use the app icon PNGs (32 px) or the mono version.
              </li>
              <li>Under 32 px, use a mono Arch n instead of the gradient one. The gradient turns muddy when it&apos;s that small.</li>
            </List>
            <div className={`${panel} mt-6 grid gap-6 p-6 sm:grid-cols-3`}>
              <div>
                <div className="flex h-16 items-end gap-4">
                  <Mark name="corpus" size={24} className="size-6" />
                  <Mark name="tinig-labs" size={24} className="size-6" />
                </div>
                <p className="mt-3 text-sm text-muted">24 px: the smallest Banig weave and Echo t</p>
              </div>
              <div>
                <div className="flex h-16 items-end gap-4">
                  <Mark name="notebook" version="mono-ink" size={20} className="size-5" />
                  <Mark name="notebook" size={32} className="size-8" />
                </div>
                <p className="mt-3 text-sm text-muted">20 px mono Arch n; the gradient from 32 px up</p>
              </div>
              <div>
                <div className="flex h-16 items-end gap-4">
                  <Img src="/brand/corpus-app-icon-32.png" size={32} className="size-8" />
                  <Img src="/brand/tinig-labs-app-icon-32.png" size={32} className="size-8" />
                  <Img src="/brand/notebook-app-icon-32.png" size={32} className="size-8" />
                </div>
                <p className="mt-3 text-sm text-muted">Smaller than that: the 32 px app icons</p>
              </div>
            </div>
          </Section>

          <Section id="colour-versions" title="Colour versions">
            <P>
              Every mark comes in four versions. Pick the version by the background. Never put the primary version on
              pandan or tinta, and never put the reversed version on gatas.
            </P>
            <div className="mt-6 space-y-4">
              {VERSIONS.map((v) => (
                <div key={v.key} className={`${panel} p-4 sm:p-6`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-text">{v.label}</h3>
                    <p className="text-sm text-muted">{v.note}</p>
                  </div>
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {v.grounds.flatMap((g) =>
                      (["corpus", "tinig-labs", "notebook"] as MarkName[]).map((n) => (
                        <li key={`${g}-${n}`} className={`flex flex-col items-center gap-3 rounded-md p-4 ring-1 ring-inset ring-border ${g}`}>
                          <Img src={markSrc(n, v.key)} size={56} alt={`${MARK_LABEL[n]}, ${v.label.toLowerCase()}, on ${GROUND_NAME[g]}`} className="size-14" />
                          <span className={`text-xs font-medium ${g.includes("pandan") || g.includes("tinta") ? "text-[var(--gatas)]" : "text-muted"}`}>
                            {MARK_LABEL[n]} on {GROUND_NAME[g]}
                          </span>
                        </li>
                      )),
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section id="app-icons" title="App icons">
            <P>
              App icons are the reversed mark at 70% size on a pandan rounded square (27-unit corner on the 120 grid).
              Use the 512 px for app stores and social profile pictures, the 180 px for home screens and the 32 px for
              favicons. The phone or app store adds its own rounding on top, so don&apos;t add extra corners or shadows.
            </P>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {(["corpus", "tinig-labs", "notebook"] as MarkName[]).map((n) => (
                <li key={n} className={`${panel} p-6`}>
                  <div className="flex items-end gap-4">
                    <Img src={`/brand/${FILE_PREFIX[n]}-app-icon.svg`} size={96} alt={`${MARK_LABEL[n]} app icon`} className="size-24" />
                    <Img src={`/brand/${FILE_PREFIX[n]}-app-icon-32.png`} size={32} alt="" className="size-8" />
                  </div>
                  <p className="mt-4 font-semibold text-text">{MARK_LABEL[n]}</p>
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    <a href={`/brand/${FILE_PREFIX[n]}-app-icon.svg`} download className={dl}>SVG</a>
                    <a href={`/brand/${FILE_PREFIX[n]}-app-icon-512.png`} download className={dl}>512</a>
                    <a href={`/brand/${FILE_PREFIX[n]}-app-icon-180.png`} download className={dl}>180</a>
                    <a href={`/brand/${FILE_PREFIX[n]}-app-icon-32.png`} download className={dl}>32</a>
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="colour" title="Colour">
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {COLOURS.map((c) => (
                <Swatch key={c.token} c={c} />
              ))}
            </ul>
            <P>
              <code className="font-medium text-text">dahon</code> was added with the logo family. Don&apos;t use it for
              text on gatas: the contrast is too low. On this site it appears only inside pandan surfaces.
            </P>
          </Section>

          <Section id="type" title="Type">
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={`${panel} p-6`}>
                <p className="text-sm font-medium text-muted">Montserrat SemiBold 600 · brand name only</p>
                <p className="mt-4 font-brand text-5xl font-semibold leading-tight tracking-[-0.02em] text-text">tinig labs</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">The wordmark and every mention of tinig labs in headings.</p>
              </div>
              <div className={`${panel} p-6`}>
                <p className="text-sm font-medium text-muted">Figtree 400, 500, 600 · everything else</p>
                <p className="mt-4 text-2xl font-semibold leading-8 tracking-tight text-text">Heading 24 / 32, 600</p>
                <p className="mt-2 text-base leading-6 text-text">Body 16 / 24, 400. Lend your voice to Tagalog speech AI.</p>
                <p className="mt-2 text-sm font-medium leading-5 text-muted">Product 14 / 20, 500: speech corpus</p>
                <p className="mt-2 text-[13px] leading-[18px] text-muted">Caption 13 / 18, 400</p>
              </div>
            </div>
            <P>IPA transcriptions use Noto Sans, for its coverage of phonetic symbols. It isn&apos;t a brand font.</P>
          </Section>

          <Section id="donts" title="Don'ts">
            <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Dont label="stretch, squash, rotate or tilt a mark.">
                <Img src={markSrc("corpus")} size={64} style={{ transform: "scaleX(1.5) rotate(-12deg)" }} />
              </Dont>
              <Dont label="put the primary version on pandan or tinta.">
                <div className="flex size-24 items-center justify-center rounded-md bg-[var(--pandan)]">
                  <Img src={markSrc("corpus")} size={64} />
                </div>
              </Dont>
              <Dont label="add shadows, outlines, glows or extra gradients.">
                <Img src={markSrc("corpus")} size={64} style={{ filter: "drop-shadow(4px 6px 3px rgb(19 38 31 / 0.45))" }} />
              </Dont>
              <Dont label="combine two marks in one lockup.">
                <span className="flex items-center gap-1">
                  <Img src={markSrc("tinig-labs")} size={44} />
                  <Img src={markSrc("corpus")} size={44} />
                </span>
              </Dont>
            </ul>
            <List>
              <li>Don&apos;t stretch, squash, rotate or tilt a mark.</li>
              <li>Don&apos;t recolour a mark outside the four versions, or use colours from outside the palette.</li>
              <li>Don&apos;t add shadows, outlines, glows or extra gradients. The Arch n&apos;s gradient is the only one in the family.</li>
              <li>Don&apos;t change the weave pattern, add strands or straighten the round ends.</li>
              <li>Don&apos;t put a mark on a busy photo, or on a background where it doesn&apos;t have enough contrast.</li>
              <li>Don&apos;t swap a product mark in for the tinig labs mark, or combine two marks in one lockup.</li>
              <li>Don&apos;t set the wordmark in any font other than Montserrat 600, and never write &ldquo;Tinig Labs&rdquo;.</li>
              <li>Don&apos;t use the old mic-and-headphones logo next to the new marks.</li>
            </List>
          </Section>

          <Section id="files" title="Files">
            <P>
              <a href="/brand/tinig-labs-logos.zip" download className={dl}>Download every logo file (ZIP)</a>, or pick
              one below. The tinig labs name and logos aren&apos;t covered by this repository&apos;s licenses.
            </P>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {FILES.map((g) => (
                <div key={g.group} className={`${panel} p-6`}>
                  <h3 className="font-semibold text-text">{g.group}</h3>
                  <ul className="mt-3 space-y-2.5 text-sm">
                    {g.items.map((f) => (
                      <li key={f.file} className="flex flex-col">
                        <a href={`/brand/${f.file}`} download className={`${dl} self-start whitespace-nowrap`}>{f.label}</a>
                        <span className="break-all text-xs text-muted">{f.file}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </article>
      </div>
    </div>
  );
}
