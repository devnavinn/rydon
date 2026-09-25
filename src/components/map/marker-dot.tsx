export type MarkerKind = "self" | "online" | "riding" | "offline" | "ride" | "start" | "destination";

export const MARKER_COLORS: Record<MarkerKind, string> = {
  self: "#2563eb",
  online: "#10b981",
  riding: "#0ea5e9",
  offline: "#9ca3af",
  ride: "#f59e0b",
  start: "#10b981",
  destination: "#ef4444",
};

const MARKER_DOT_CLASS = "block size-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]";

/** Same dot as <MarkerDot>, as an HTML string for SDKs that take marker markup (Mappls). */
export function markerDotHtml(kind: MarkerKind, pulse?: boolean) {
  const color = MARKER_COLORS[kind];
  const animation = pulse ? "animation: rydo-pulse 1.6s ease-out infinite;" : "";
  return `<span data-rydo-marker class="${MARKER_DOT_CLASS} cursor-pointer" style="background: ${color}; --pulse-color: ${color}55; ${animation}"></span>`;
}

export function MarkerDot({ kind, pulse }: { kind: MarkerKind; pulse?: boolean }) {
  const color = MARKER_COLORS[kind];
  return (
    <span
      className={MARKER_DOT_CLASS}
      style={{
        background: color,
        animation: pulse ? "rydo-pulse 1.6s ease-out infinite" : undefined,
        ["--pulse-color" as string]: `${color}55`,
      }}
    />
  );
}
