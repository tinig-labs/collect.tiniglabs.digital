import type { Metadata, Viewport } from "next";
import { Figtree, Montserrat, Noto_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
        <SiteFooter
          current="corpus"
          links={[
            { label: "Guide", href: "/guide" },
            { label: "Sources and licenses", href: "/sources" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      </body>
    </html>
  );
}
