import { ImageResponse } from "next/og";

import { BACKGROUND, Logo, MUTED, PRIMARY } from "@/components/og/og-brand";

export const alt = "Rydo — find your riding brotherhood";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default share card for every page without its own (home, about, safety...).
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 80,
          background: `linear-gradient(135deg, ${BACKGROUND} 55%, #3a2413 100%)`,
          color: "white",
        }}
      >
        <Logo />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>Find your riding brotherhood.</div>
          <div style={{ fontSize: 36, color: MUTED }}>
            Riders near you. Group rides. Live tracking.
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 30, color: PRIMARY }}>
          <span>Breakfast rides</span>
          <span>·</span>
          <span>Highway runs</span>
          <span>·</span>
          <span>Weekend tours</span>
        </div>
      </div>
    ),
    size
  );
}
