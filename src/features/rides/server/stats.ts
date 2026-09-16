import "server-only";

import { prisma } from "@/lib/prisma";
import { computeTrackDistanceKm } from "@/lib/geo";
import { computeRiderLevel } from "@/lib/rider-level";
import { evaluateNewBadges } from "@/lib/badges";
import { createNotifications } from "@/features/notifications/server/mutations";
import type { NotificationInput } from "@/features/notifications/server/mutations";

/** Computes per-rider distance/duration from location pings for a just-ended
 * ride, rolls them into the rider's lifetime stats and level, and awards any
 * newly-earned badges. Called once from `endRide`. */
export async function computeRideStatsForMembers(rideId: string, windowStart: Date, windowEnd: Date) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: {
      id: true,
      style: true,
      group: { select: { id: true } },
      members: { where: { status: "JOINED" }, select: { id: true, userId: true } },
    },
  });
  if (!ride?.group || ride.members.length === 0) return;

  const notifications: NotificationInput[] = [];

  for (const member of ride.members) {
    const pings = await prisma.locationPing.findMany({
      where: { groupId: ride.group.id, userId: member.userId, recordedAt: { gte: windowStart, lte: windowEnd } },
      select: { latitude: true, longitude: true, recordedAt: true },
      orderBy: { recordedAt: "asc" },
    });

    const points = pings.map((p) => ({
      lat: Number(p.latitude),
      lng: Number(p.longitude),
      recordedAt: p.recordedAt,
    }));

    const distanceKm = points.length >= 2 ? Math.round(computeTrackDistanceKm(points)) : 0;
    const durationMin =
      points.length >= 2
        ? Math.round(
            (points[points.length - 1].recordedAt.getTime() - points[0].recordedAt.getTime()) / 60_000
          )
        : 0;
    const avgSpeedKph = durationMin > 0 ? distanceKm / (durationMin / 60) : 0;

    const [, profile, ridesHosted] = await prisma.$transaction([
      prisma.rideMember.update({
        where: { id: member.id },
        data: { status: "COMPLETED", distanceKm, durationMin, avgSpeedKph, statsComputedAt: new Date() },
      }),
      prisma.riderProfile.update({
        where: { userId: member.userId },
        data: { totalRides: { increment: 1 }, totalDistanceKm: { increment: distanceKm } },
      }),
      prisma.ride.count({ where: { hostId: member.userId, status: "COMPLETED" } }),
    ]);

    const newLevel = computeRiderLevel(profile.totalRides, profile.totalDistanceKm);
    if (newLevel !== profile.level) {
      await prisma.riderProfile.update({ where: { id: profile.id }, data: { level: newLevel } });
    }

    const earnedCodes = new Set(
      (await prisma.riderBadge.findMany({ where: { riderProfileId: profile.id }, select: { code: true } })).map(
        (b) => b.code
      )
    );
    const newBadges = evaluateNewBadges(
      {
        totalRides: profile.totalRides,
        totalDistanceKm: profile.totalDistanceKm,
        level: newLevel,
        ridesHosted,
        ride: { style: ride.style, distanceKm },
      },
      earnedCodes
    );

    if (newBadges.length > 0) {
      await prisma.riderBadge.createMany({
        data: newBadges.map((b) => ({ riderProfileId: profile.id, code: b.code, rideId: ride.id })),
        skipDuplicates: true,
      });
      for (const badge of newBadges) {
        notifications.push({
          userId: member.userId,
          type: "BADGE_EARNED",
          title: "New badge earned!",
          body: `You earned "${badge.label}" — ${badge.description}`,
          data: { badgeCode: badge.code, rideId: ride.id },
        });
      }
    }
  }

  await createNotifications(notifications);
}
