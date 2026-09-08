import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { leaveRide } from "@/features/rides/server/mutations";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { rideId } = await params;
  try {
    const member = await leaveRide(rideId, user.id);
    return NextResponse.json({ member });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to leave ride";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
