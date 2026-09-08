import L from "leaflet";

// react-leaflet's default marker icon URLs break under bundlers because the
// referenced image assets aren't resolved — point them at the CDN instead.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type MarkerKind = "self" | "online" | "riding" | "offline" | "ride" | "start" | "destination";

const COLORS: Record<MarkerKind, string> = {
  self: "#2563eb",
  online: "#10b981",
  riding: "#0ea5e9",
  offline: "#9ca3af",
  ride: "#f59e0b",
  start: "#10b981",
  destination: "#ef4444",
};

export function coloredIcon(kind: MarkerKind, pulse = false) {
  const color = COLORS[kind];
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;
      width:14px;height:14px;
      border-radius:9999px;
      background:${color};
      border:2px solid white;
      box-shadow:0 0 0 1px rgba(0,0,0,0.15);
      ${pulse ? "animation:rydo-pulse 1.6s ease-out infinite;" : ""}
    "></span>
    <style>
      @keyframes rydo-pulse {
        0% { box-shadow: 0 0 0 0 ${color}55; }
        70% { box-shadow: 0 0 0 8px ${color}00; }
        100% { box-shadow: 0 0 0 0 ${color}00; }
      }
    </style>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}
