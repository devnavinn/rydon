/** Shared pieces for `next/og` share images. Inline styles only — Satori has no CSS. */

// Hex approximations of the app's oklch theme tokens (Satori can't parse oklch).
export const BACKGROUND = "#17120e";
export const PRIMARY = "#f0913a";
export const MUTED = "#a89f97";

export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: 12,
          background: PRIMARY,
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
          <path d="M4 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z" stroke={BACKGROUND} strokeWidth="2" />
          <path d="M13 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z" stroke={BACKGROUND} strokeWidth="2" />
          <path
            d="M7.5 17.5 10 9h3l1.2 2.4M10 9 8.5 6h-2"
            stroke={BACKGROUND}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M13 9h3.5l1 2.4" stroke={BACKGROUND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 4, color: "white" }}>RYDO</div>
    </div>
  );
}
