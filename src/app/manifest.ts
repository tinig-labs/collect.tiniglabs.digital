import type { MetadataRoute } from "next";

// Install metadata for phones: the speech corpus app icon, on the gatas page colour.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tinig labs speech corpus",
    short_name: "speech corpus",
    description: "Record Tagalog words and sentences for an open speech dataset.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fbfa",
    theme_color: "#f9fbfa",
    icons: [
      { src: "/brand/corpus-app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/corpus-app-icon-180.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/brand/corpus-app-icon-32.png", sizes: "32x32", type: "image/png", purpose: "any" },
      { src: "/brand/corpus-app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
