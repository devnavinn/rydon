import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { isRideMember } from "@/features/rides/server/queries";
import { getActiveTrackingLink } from "@/features/tracking/server/queries";
import { createOrRefreshTrackingLink, revokeTrackingLink } from "@/features/tracking/server/mutations";

async function requireMember(rideId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthenticated" }, { status: 401 }) } as const;
  if (!(await isRideMember(rideId, user.id))) {
    return {
      error: NextResponse.json({ error: "Not a member of this ride" }, { status: 403 }),
    } as const;
  }
  return { userId: user.id } as const;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  const { rideId } = await params;
  const result = await requireMember(rideId);
  if ("error" in result) return result.error;

  const link = await getActiveTrackingLink(rideId, result.userId);
  return NextResponse.json({ link });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  const { rideId } = await params;
  const result = await requireMember(rideId);
  if ("error" in result) return result.error;

  const link = await createOrRefreshTrackingLink(rideId, result.userId);
  return NextResponse.json({ link });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  const { rideId } = await params;
  const result = await requireMember(rideId);
  if ("error" in result) return result.error;

  await revokeTrackingLink(rideId, result.userId);
  return NextResponse.json({ ok: true });
}
