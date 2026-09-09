import "server-only";

import { prisma } from "@/lib/prisma";
import { boundingBox, haversineDistanceKm } from "@/lib/geo";
import { getBlockedUserIds } from "@/features/blocking/server/queries";
import type { NearbyRidersQuery } from "@/features/riders/validators";
import type { NearbyRider, RiderStatus } from "@/features/riders/types";

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

function deriveStatus(lastSeenAt: Date | null, isRiding: boolean): RiderStatus {
  if (isRiding) return "riding";
  if (lastSeenAt && Date.now() - lastSeenAt.getTime() < ONLINE_THRESHOLD_MS) return "online";
  return "offline";
}

export async function findNearbyRiders(
  query: NearbyRidersQuery,
  excludeUserId?: string
): Promise<NearbyRider[]> {
  const center = { lat: query.lat, lng: query.lng };
  const box = boundingBox(center, query.radiusKm);
  const blockedIds = excludeUserId ? await getBlockedUserIds(excludeUserId) : [];

  const profiles = await prisma.riderProfile.findMany({
    where: {
      latitude: { gte: box.minLat, lte: box.maxLat },
      longitude: { gte: box.minLng, lte: box.maxLng },
      ...(query.style ? { ridingStyle: query.style } : {}),
      ...(excludeUserId ? { userId: { notIn: [excludeUserId, ...blockedIds] } } : {}),
    },
    select: {
      userId: true,
      fullName: true,
      avatarUrl: true,
      city: true,
      ridingStyle: true,
      level: true,
      latitude: true,
      longitude: true,
      user: {
        select: {
          username: true,
          lastSeenAt: true,
          isActive: true,
          bikes: {
            where: { isPrimary: true },
            select: { brand: true, model: true, year: true },
            take: 1,
          },
          rideMembers: {
            where: {
              status: { in: ["JOINED", "APPROVED"] },
              ride: { status: "ONGOING" },
            },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
    take: 200,
  });

  const results: NearbyRider[] = [];

  for (const profile of profiles) {
    if (!profile.latitude || !profile.longitude) continue;
    if (!profile.user.isActive) continue;

    const point = { lat: Number(profile.latitude), lng: Number(profile.longitude) };
    const distanceKm = haversineDistanceKm(center, point);
    if (distanceKm > query.radiusKm) continue;

    const bike = profile.user.bikes[0] ?? null;

    results.push({
      userId: profile.userId,
      username: profile.user.username,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      city: profile.city,
      ridingStyle: profile.ridingStyle,
      level: profile.level,
      distanceKm,
      latitude: point.lat,
      longitude: point.lng,
      status: deriveStatus(profile.user.lastSeenAt, profile.user.rideMembers.length > 0),
      bike,
    });
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}
