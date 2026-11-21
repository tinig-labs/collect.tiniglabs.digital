import type { Metadata } from "next";
import { MAIN_SITE_URL, SITE_URL } from "@/lib/constants";

const SUFFIX = " · tinig labs speech corpus";

/**
 * Metadata for an indexable page: a self-canonical and matching Open Graph and Twitter tags.
 * Child metadata replaces openGraph/twitter wholesale, so public pages go through this.
 * The og:image comes from src/app/opengraph-image.tsx.
 */
export function publicPage({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const social = title ? `${title}${SUFFIX}` : "Tagalog Speech Corpus · tinig labs";
  const image = { url: "/opengraph-image", width: 1200, height: 630, alt: "Lend your voice to Tagalog speech AI" };
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "tinig labs", locale: "en_PH", title: social, description, url: path, images: [image] },
    twitter: { card: "summary_large_image", title: social, description, images: [image] },
  };
}

export const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${MAIN_SITE_URL}/#organization`,
  name: "tinig labs",
  url: `${MAIN_SITE_URL}/`,
  logo: `${SITE_URL}/brand/tinig-labs-app-icon-512.png`,
  sameAs: [SITE_URL, "https://github.com/tinig-labs"],
} as const;

/** Serialized JSON-LD for a <script type="application/ld+json">, with `<` escaped. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\u003c") };
}
