import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Figtree, Montserrat, Noto_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { Brand, Wordmark } from "@/components/brand";
import { UNDER_DEVELOPMENT } from "@/lib/constants";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"] });
// Brand name only: the wordmark and every mention of tinig labs
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["600"] });
// Broad IPA coverage for transcriptions and the keyboard
const noto = Noto_Sans({ variable: "--font-noto", subsets: ["latin", "latin-ext"], display: "swap" });

export const SITE_URL = "https://collect.tiniglabs.digital";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Speech Corpus · tinig labs", template: "%s · tinig labs speech corpus" },
  description: "An open Tagalog speech corpus with IPA transcriptions verified by speech professionals.",
  icons: { icon: "/logo.svg" },
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "tinig labs", url: "/" },
  robots: UNDER_DEVELOPMENT ? { index: false, follow: false } : undefined,
};

// viewport-fit=cover so env(safe-area-inset-*) works under the phone tab bar.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f9fbfa" };

const FOOTER_LINKS = [
  { label: "Guide", href: "/guide" },
  { label: "Contact", href: "/contact" },
  { label: "Sources & licenses", href: "/sources" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "tiniglabs.digital", href: "https://tiniglabs.digital" },
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
                  <a href={l.href} className="text-text/80 underline-offset-4 transition-colors hover:text-accent hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 border-t border-border pt-6 text-sm text-muted">
            <p>
              <Brand>tinig</Brand> is Filipino for voice. © 2026 <Brand />
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
