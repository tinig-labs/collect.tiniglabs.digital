import { ImageResponse } from "next/og";
import { CORPUS_MARK, FIGTREE_500, FIGTREE_600, MONTSERRAT_600 } from "./og-assets";

// Gatas card with a mint panel, like tiniglabs.digital, led by the speech corpus lockup.
export const alt = "Lend your voice to Tagalog speech AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", padding: 48, background: "#F9FBFA", fontFamily: "Figtree" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 72px",
            borderRadius: 48,
            background: "#E2F3EA",
            color: "#13261F",
          }}
        >
          {/* Lockup at 32 px wordmark: 56 px mark, 18 px gap, 24 px product name. */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img src={CORPUS_MARK} width={56} height={56} alt="" />
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 32, letterSpacing: "-0.02em", color: "#13261F" }}>
                tinig labs
              </span>
              <span style={{ fontWeight: 500, fontSize: 24, color: "#5F6F68" }}>speech corpus</span>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: 940 }}>
            Lend your voice to Tagalog speech AI.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 500, color: "#5F6F68" }}>
            <span style={{ color: "#1F6B4F", fontWeight: 600 }}>Open Tagalog speech corpus</span>
            <span>collect.tiniglabs.digital</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: bytes(MONTSERRAT_600), weight: 600, style: "normal" },
        { name: "Figtree", data: bytes(FIGTREE_500), weight: 500, style: "normal" },
        { name: "Figtree", data: bytes(FIGTREE_600), weight: 600, style: "normal" },
      ],
    },
  );
}
