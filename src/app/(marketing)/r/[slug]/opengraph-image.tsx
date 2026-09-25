import { ImageResponse } from "next/og";

import { getPublicRide } from "@/features/rides/server/queries";
import { formatRideDay, formatRideStyle, formatRideTime } from "@/features/rides/format";

export const alt = "Group ride on Rydo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Hex approximations of the app's oklch theme tokens (Satori can't parse oklch).
const BACKGROUND = "#17120e";
const PRIMARY = "#f0913a";
const MUTED = "#a89f97";

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function Logo() {
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

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ride = await getPublicRide(slug);

  // Non-public rides get a generic card so the image URL can't leak details.
  if (!ride || ride.visibility !== "PUBLIC") {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 32,
            width: "100%",
            height: "100%",
            padding: 80,
            background: BACKGROUND,
          }}
        >
          <Logo />
          <div style={{ fontSize: 64, fontWeight: 700, color: "white" }}>Find your riding crew.</div>
        </div>
      ),
      size
    );
  }

  const spotsLeft = Math.max(ride.maxRiders - ride.memberCount, 0);
  const title = clip(ride.title, 60);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          background: `linear-gradient(135deg, ${BACKGROUND} 55%, #3a2413 100%)`,
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <div
            style={{
              display: "flex",
              padding: "10px 24px",
              borderRadius: 999,
              border: `2px solid ${PRIMARY}`,
              color: PRIMARY,
              fontSize: 28,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {formatRideStyle(ride.style)} ride
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: title.length > 32 ? 64 : 80, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, color: MUTED }}>
            <span>{clip(ride.startLocationName.split(",")[0], 28)}</span>
            <span style={{ color: PRIMARY }}>→</span>
            <span>{clip(ride.destinationName.split(",")[0], 28)}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 32 }}>
          <div style={{ display: "flex", gap: 40 }}>
            <span>{formatRideDay(ride.rideDate)}</span>
            <span>{formatRideTime(ride.meetupTime)}</span>
            {ride.estimatedDistanceKm ? <span>{ride.estimatedDistanceKm} km</span> : null}
          </div>
          <div style={{ display: "flex", color: PRIMARY, fontWeight: 700 }}>
            {spotsLeft > 0 ? `${ride.memberCount} going · ${spotsLeft} spots left` : `${ride.memberCount} going`}
          </div>
        </div>
      </div>
    ),
    size
  );
}
