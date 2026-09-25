import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { directionsQuerySchema } from "@/features/rides/validators";

type MapplsRouteResponse = {
  routes?: { geometry?: { coordinates?: [number, number][] } }[];
};

/** Road route between two points via the Mappls routing API, as [lat, lng] pairs. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const parsed = directionsQuerySchema.safeParse({
    fromLat: searchParams.get("fromLat"),
    fromLng: searchParams.get("fromLng"),
    toLat: searchParams.get("toLat"),
    toLng: searchParams.get("toLng"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const token = process.env.MAPPLS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Routing unavailable" }, { status: 503 });
  }

  const { fromLat, fromLng, toLat, toLng } = parsed.data;
  const url = new URL(
    `https://route.mappls.com/route/direction/route_adv/driving/${fromLng},${fromLat};${toLng},${toLat}`,
  );
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("overview", "full");
  url.searchParams.set("access_token", token);

  const res = await fetch(url, { cache: "no-store" }).catch(() => null);
  const data = res?.ok ? ((await res.json()) as MapplsRouteResponse) : null;
  const coordinates = data?.routes?.[0]?.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) {
    return NextResponse.json({ error: "No route found" }, { status: 502 });
  }

  const points = coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
  return NextResponse.json({ points });
}
