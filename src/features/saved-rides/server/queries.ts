import "server-only";

import { prisma } from "@/lib/prisma";
import type { SavedRideSummary } from "@/features/saved-rides/types";

export async function listSavedRides(userId: string): Promise<SavedRideSummary[]> {
  const rows = await prisma.savedRide.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      ride: {
        select: {
          id: true,
          slug: true,
          title: true,
          style: true,
          status: true,
          rideDate: true,
          meetupTime: true,
          startLocationName: true,
          destinationName: true,
          maxRiders: true,
          host: { select: { username: true, riderProfile: { select: { fullName: true } } } },
          _count: { select: { members: { where: { status: { in: ["JOINED", "APPROVED"] } } } } },
        },
      },
    },
  });

  return rows.map((row) => ({
    savedRideId: row.id,
    savedAt: row.createdAt.toISOString(),
    id: row.ride.id,
    slug: row.ride.slug,
    title: row.ride.title,
    style: row.ride.style,
    status: row.ride.status,
    rideDate: row.ride.rideDate.toISOString(),
    meetupTime: row.ride.meetupTime.toISOString(),
    startLocationName: row.ride.startLocationName,
    destinationName: row.ride.destinationName,
    maxRiders: row.ride.maxRiders,
    memberCount: row.ride._count.members,
    host: {
      username: row.ride.host.username,
      fullName: row.ride.host.riderProfile?.fullName ?? row.ride.host.username,
    },
  }));
}

export async function getSavedRideIds(userId: string): Promise<string[]> {
  const rows = await prisma.savedRide.findMany({ where: { userId }, select: { rideId: true } });
  return rows.map((r) => r.rideId);
}
