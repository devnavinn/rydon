import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRideDetail } from "@/features/rides/server/queries";
import { startRide, endRide, setMemberStatus } from "@/features/rides/server/mutations";
import { rideStatusUpdateSchema } from "@/features/rides/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { rideId } = await params;
  const ride = await getRideDetail(rideId);
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  return NextResponse.json({ ride });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { rideId } = await params;
  const body = await request.json();
  const parsed = rideStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { hostId: true },
  });
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  if (ride.hostId !== user.id) {
    return NextResponse.json({ error: "Only the host can do that" }, { status: 403 });
  }

  const { action, memberId } = parsed.data;

  try {
    if (action === "start") await startRide(rideId);
    else if (action === "end" || action === "cancel") await endRide(rideId);
    else if (action === "approve_member" && memberId) {
      await setMemberStatus(rideId, memberId, "APPROVED");
    } else if (action === "reject_member" && memberId) {
      await setMemberStatus(rideId, memberId, "REJECTED");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const updated = await getRideDetail(rideId);
  return NextResponse.json({ ride: updated });
}
