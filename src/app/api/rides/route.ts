import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { nearbyRidesQuerySchema, createRideSchema } from "@/features/rides/validators";
import { findNearbyRides } from "@/features/rides/server/queries";
import { createRide } from "@/features/rides/server/mutations";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const parsed = nearbyRidesQuerySchema.safeParse({
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
    radiusKm: searchParams.get("radiusKm") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const rides = await findNearbyRides(parsed.data);
  return NextResponse.json({ rides });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await request.json();
  const parsed = createRideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const ride = await createRide(user.id, parsed.data);
  return NextResponse.json({ ride }, { status: 201 });
}
