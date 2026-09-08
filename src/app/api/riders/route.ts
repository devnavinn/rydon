import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Simple rider directory lookup by username, distinct from /api/nearby-riders'
// location-based search.
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ riders: [] });

  const riders = await prisma.user.findMany({
    where: { username: { contains: q, mode: "insensitive" } },
    select: {
      username: true,
      riderProfile: { select: { fullName: true, city: true, avatarUrl: true } },
    },
    take: 20,
  });

  return NextResponse.json({ riders });
}
