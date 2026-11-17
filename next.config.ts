import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Pages are static/ISR, so a per-request nonce isn't possible; Next's inline RSC scripts need
// 'unsafe-inline'. Everything else is locked to this origin plus the audio and R2 upload hosts.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com", // + AudioWorklet from /worklets
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:", // next/font self-hosts Google Fonts
  "media-src 'self' blob: https://audio.tiniglabs.digital",
  "connect-src 'self' blob: https://audio.tiniglabs.digital https://*.r2.cloudflarestorage.com https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com", // Turnstile
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  // Classic ISR/route caching: fully supported by OpenNext on Cloudflare.
  poweredByHeader: false,
  compress: false, // Cloudflare compresses at the edge
  images: { unoptimized: true }, // no image optimisation bill; site has no photos
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        source: "/worklets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
