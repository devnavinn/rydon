import "server-only";

import { prisma } from "@/lib/prisma";
import { boundingBox, haversineDistanceKm } from "@/lib/geo";
import type { NearbyRidesQuery } from "@/features/rides/validators";
import type { NearbyRide, RideDetail } from "@/features/rides/types";

export async function findNearbyRides(query: NearbyRidesQuery): Promise<NearbyRide[]> {
  const center = { lat: query.lat, lng: query.lng };
  const box = boundingBox(center, query.radiusKm);

  const rides = await prisma.ride.findMany({
    where: {
      status: { in: ["PUBLISHED", "ONGOING"] },
      visibility: "PUBLIC",
      startLatitude: { gte: box.minLat, lte: box.maxLat },
      startLongitude: { gte: box.minLng, lte: box.maxLng },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      style: true,
      status: true,
      rideDate: true,
      meetupTime: true,
      startLocationName: true,
      startLatitude: true,
      startLongitude: true,
      destinationName: true,
      destinationLatitude: true,
      destinationLongitude: true,
      maxRiders: true,
      host: { select: { username: true, riderProfile: { select: { fullName: true } } } },
      _count: {
        select: { members: { where: { status: { in: ["JOINED", "APPROVED"] } } } },
      },
    },
    take: 200,
  });

  const results: NearbyRide[] = [];

  for (const ride of rides) {
    const point = { lat: Number(ride.startLatitude), lng: Number(ride.startLongitude) };
    const distanceKm = haversineDistanceKm(center, point);
    if (distanceKm > query.radiusKm) continue;

    results.push({
      id: ride.id,
      slug: ride.slug,
      title: ride.title,
      style: ride.style,
      status: ride.status,
      rideDate: ride.rideDate.toISOString(),
      meetupTime: ride.meetupTime.toISOString(),
      startLocationName: ride.startLocationName,
      startLatitude: point.lat,
      startLongitude: point.lng,
      destinationName: ride.destinationName,
      destinationLatitude: Number(ride.destinationLatitude),
      destinationLongitude: Number(ride.destinationLongitude),
      maxRiders: ride.maxRiders,
      memberCount: ride._count.members,
      distanceKm,
      host: {
        username: ride.host.username,
        fullName: ride.host.riderProfile?.fullName ?? ride.host.username,
      },
    });
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function getRideDetail(rideId: string): Promise<RideDetail | null> {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      notes: true,
      style: true,
      status: true,
      visibility: true,
      rideDate: true,
      meetupTime: true,
      maxRiders: true,
      minRiders: true,
      requiresApproval: true,
      allowPillion: true,
      helmetRequired: true,
      startLocationName: true,
      startLatitude: true,
      startLongitude: true,
      destinationName: true,
      destinationLatitude: true,
      destinationLongitude: true,
      hostId: true,
      group: { select: { id: true, activeFrom: true } },
      members: {
        where: { status: { not: "LEFT" } },
        select: {
          id: true,
          userId: true,
          status: true,
          roleLabel: true,
          user: {
            select: {
              username: true,
              riderProfile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!ride) return null;

  return {
    id: ride.id,
    slug: ride.slug,
    title: ride.title,
    description: ride.description,
    notes: ride.notes,
    style: ride.style,
    status: ride.status,
    visibility: ride.visibility,
    rideDate: ride.rideDate.toISOString(),
    meetupTime: ride.meetupTime.toISOString(),
    maxRiders: ride.maxRiders,
    minRiders: ride.minRiders,
    requiresApproval: ride.requiresApproval,
    allowPillion: ride.allowPillion,
    helmetRequired: ride.helmetRequired,
    startLocationName: ride.startLocationName,
    startLatitude: Number(ride.startLatitude),
    startLongitude: Number(ride.startLongitude),
    destinationName: ride.destinationName,
    destinationLatitude: Number(ride.destinationLatitude),
    destinationLongitude: Number(ride.destinationLongitude),
    hostId: ride.hostId,
    groupId: ride.group?.id ?? null,
    groupActiveFrom: ride.group?.activeFrom?.toISOString() ?? null,
    members: ride.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      username: m.user.username,
      fullName: m.user.riderProfile?.fullName ?? m.user.username,
      avatarUrl: m.user.riderProfile?.avatarUrl ?? null,
      status: m.status,
      roleLabel: m.roleLabel,
    })),
  };
}
