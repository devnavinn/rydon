import { NextResponse } from "next/server";

import { resolveTrackingLink } from "@/features/tracking/server/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const info = await resolveTrackingLink(token);
  if (!info) return NextResponse.json({ error: "Link expired or not found" }, { status: 404 });

  return NextResponse.json({
    info: {
      rideTitle: info.rideTitle,
      rideStatus: info.rideStatus,
      riderFullName: info.riderFullName,
      riderAvatarUrl: info.riderAvatarUrl,
      startLocationName: info.startLocationName,
      destinationName: info.destinationName,
      expiresAt: info.expiresAt,
    },
  });
}
