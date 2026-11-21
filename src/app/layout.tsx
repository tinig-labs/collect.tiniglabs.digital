import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Figtree, Montserrat, Noto_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { Brand, LabWordmark, Wordmark } from "@/components/brand";
import { MAIN_SITE_URL, SITE_URL, UNDER_DEVELOPMENT } from "@/lib/constants";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"] });
// Brand name only: the wordmark and every mention of tinig labs
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["600"] });
// Broad IPA coverage for transcriptions and the keyboard
const noto = Noto_Sans({ variable: "--font-noto", subsets: ["latin", "latin-ext"], display: "swap" });

const description =
  "Record Tagalog words and sentences for an open speech dataset. Speech professionals verify every IPA transcription.";

// Defaults only. Public pages set their own canonical; private ones set robots: NOINDEX.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Tagalog Speech Corpus · tinig labs", template: "%s · tinig labs speech corpus" },
  description,
  applicationName: "tinig labs speech corpus",
  authors: [{ name: "tinig labs", url: MAIN_SITE_URL }],
  publisher: "tinig labs",
  keywords: [
    "Tagalog speech dataset",
    "Filipino speech corpus",
    "IPA transcription",
    "open speech data",
    "speech therapy",
    "cleft palate speech",
    "speech recognition",
  ],
  // Speech corpus app icon (Banig weave on pandan). favicon.ico in src/app covers older browsers.
  icons: {
    icon: [
      { url: "/brand/corpus-app-icon.svg", type: "image/svg+xml" },
      { url: "/brand/corpus-app-icon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/brand/corpus-app-icon-180.png", sizes: "180x180" }],
  },
  openGraph: { type: "website", siteName: "tinig labs", locale: "en_PH", description },
  twitter: { card: "summary_large_image", description },
};

// viewport-fit=cover so env(safe-area-inset-*) works under the phone tab bar.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f9fbfa" };

const FOOTER_LINKS = [
  { label: "Guide", href: "/guide" },
  { label: "Contact", href: "/contact" },
  { label: "Sources & licenses", href: "/sources" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Brand", href: "/brand" },
  { label: "tiniglabs.digital", href: MAIN_SITE_URL },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${montserrat.variable} ${noto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] font-sans sm:pb-0">
        {UNDER_DEVELOPMENT && (
          <div role="status" className="bg-text px-5 py-2.5 text-center text-sm text-bg">
            <span className="font-semibold">Under development.</span>{" "}
            <span className="text-bg/75 sm:hidden">Recordings may be reset.</span>
            <span className="hidden text-bg/75 sm:inline">Things may break, and recordings made now may be reset.</span>
          </div>
        )}
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-20 pt-6 sm:px-10 sm:pb-28 sm:pt-10">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-14 sm:px-10 sm:pb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <Link href="/" aria-label="Speech corpus home" className="self-start rounded-sm">
              <Wordmark size="sm" />
            </Link>
            <ul className="flex flex-wrap gap-x-7 gap-y-2 text-sm font-medium">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="rounded-sm text-text/80 underline-offset-4 transition-colors hover:text-accent hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              <Brand>tinig</Brand> is Filipino for voice. © 2026 <Brand />
            </p>
            {/* The parent lab gets its own mark, the Echo t. */}
            <a
              href={MAIN_SITE_URL}
              aria-label="A project of tinig labs: tiniglabs.digital"
              className="inline-flex items-center gap-2.5 self-start rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-surface sm:self-auto"
            >
              <span className="text-xs font-medium text-muted">A project of</span>
              <LabWordmark />
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
