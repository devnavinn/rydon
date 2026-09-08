import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { nearbyRidersQuerySchema } from "@/features/riders/validators";
import { findNearbyRiders } from "@/features/riders/server/queries";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const parsed = nearbyRidersQuerySchema.safeParse({
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
    radiusKm: searchParams.get("radiusKm") ?? undefined,
    style: searchParams.get("style") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const riders = await findNearbyRiders(parsed.data, user.id);
  return NextResponse.json({ riders });
}
