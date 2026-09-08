import { NextResponse } from "next/server";

// Direct rider-to-rider ride invites aren't implemented yet — riders currently
// discover and join public rides via /api/rides/[rideId]/join.
export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
