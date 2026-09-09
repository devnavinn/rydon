import "server-only";

import { prisma } from "@/lib/prisma";
import type { PublicTrackingInfo, LivePosition } from "@/features/tracking/types";

export async function getActiveTrackingLink(rideId: string, userId: string) {
  const link = await prisma.trackingLink.findUnique({
    where: { rideId_userId: { rideId, userId } },
  });
  if (!link || link.revokedAt || link.expiresAt < new Date()) return null;
  return { token: link.token, expiresAt: link.expiresAt.toISOString() };
}

/** Resolves a public tracking token to display info, or null if the link doesn't exist, was revoked, or expired. */
export async function resolveTrackingLink(
  token: string
): Promise<(PublicTrackingInfo & { groupId: string | null; userId: string }) | null> {
  const link = await prisma.trackingLink.findUnique({
    where: { token },
    select: {
      expiresAt: true,
      revokedAt: true,
      userId: true,
      ride: {
        select: {
          title: true,
          status: true,
          startLocationName: true,
          destinationName: true,
          group: { select: { id: true } },
        },
      },
      user: {
        select: { username: true, riderProfile: { select: { fullName: true, avatarUrl: true } } },
      },
    },
  });
  if (!link || link.revokedAt || link.expiresAt < new Date()) return null;

  return {
    rideTitle: link.ride.title,
    rideStatus: link.ride.status,
    riderFullName: link.user.riderProfile?.fullName ?? link.user.username,
    riderAvatarUrl: link.user.riderProfile?.avatarUrl ?? null,
    startLocationName: link.ride.startLocationName,
    destinationName: link.ride.destinationName,
    expiresAt: link.expiresAt.toISOString(),
    groupId: link.ride.group?.id ?? null,
    userId: link.userId,
  };
}

export async function getLivePosition(groupId: string, userId: string): Promise<LivePosition | null> {
  const ping = await prisma.locationPing.findFirst({
    where: { groupId, userId },
    orderBy: { recordedAt: "desc" },
    select: { latitude: true, longitude: true, speedKph: true, recordedAt: true },
  });
  if (!ping) return null;
  return {
    latitude: Number(ping.latitude),
    longitude: Number(ping.longitude),
    speedKph: ping.speedKph ? Number(ping.speedKph) : null,
    recordedAt: ping.recordedAt.toISOString(),
  };
}
