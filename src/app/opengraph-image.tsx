import { ImageResponse } from "next/og";

// Same card as tiniglabs.digital: milk background, mint panel, pandan accent.
export const alt = "Lend your voice to Tagalog speech AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", padding: 48, background: "#F9FBFA" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            borderRadius: 40,
            background: "#E2F3EA",
            color: "#13261F",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 600, color: "#1F6B4F" }}>
            <div style={{ width: 16, height: 16, borderRadius: 999, background: "#1F6B4F" }} />
            Open Tagalog speech corpus
          </div>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: 940 }}>
            Lend your voice to Tagalog speech AI.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#5F6F68" }}>
            <span style={{ color: "#13261F", fontWeight: 600 }}>tinig labs</span>
            <span>collect.tiniglabs.digital</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
