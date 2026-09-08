import "server-only";

import { prisma } from "@/lib/prisma";
import type { MemberPosition } from "@/features/groups/types";

export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { id: true },
  });
  return Boolean(member);
}

export async function getLatestPositions(groupId: string): Promise<MemberPosition[]> {
  const pings = await prisma.locationPing.findMany({
    where: { groupId },
    orderBy: { recordedAt: "desc" },
    take: 500,
    select: {
      userId: true,
      latitude: true,
      longitude: true,
      speedKph: true,
      recordedAt: true,
    },
  });

  const latestByUser = new Map<string, (typeof pings)[number]>();
  for (const ping of pings) {
    if (!latestByUser.has(ping.userId)) latestByUser.set(ping.userId, ping);
  }

  return Array.from(latestByUser.values()).map((p) => ({
    userId: p.userId,
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
    speedKph: p.speedKph ? Number(p.speedKph) : null,
    recordedAt: p.recordedAt.toISOString(),
  }));
}
