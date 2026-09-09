import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { saveRide, unsaveRide } from "@/features/saved-rides/server/mutations";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { rideId } = await params;
  try {
    await saveRide(user.id, rideId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save ride";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { rideId } = await params;
  await unsaveRide(user.id, rideId);
  return NextResponse.json({ ok: true });
}
