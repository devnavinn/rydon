import { NextResponse } from "next/server";

// Standalone group management isn't implemented yet — group state is read
// through /api/rides/[rideId] and live positions through
// /api/groups/[groupId]/location.
export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
