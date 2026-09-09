import "server-only";

import { prisma } from "@/lib/prisma";
import type { BlockedUserDTO } from "@/features/blocking/types";

/** Did `blockerId` specifically block `blockedId`? (directional — drives the profile button state.) */
export async function hasBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const row = await prisma.userBlock.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    select: { id: true },
  });
  return Boolean(row);
}

/** Either direction — drives discovery/join visibility, which should feel mutual. */
export async function isBlockedEitherWay(userA: string, userB: string): Promise<boolean> {
  const row = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const rows = await prisma.userBlock.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set<string>();
  for (const row of rows) {
    ids.add(row.blockerId === userId ? row.blockedId : row.blockerId);
  }
  return Array.from(ids);
}

export async function listBlockedUsers(userId: string): Promise<BlockedUserDTO[]> {
  const rows = await prisma.userBlock.findMany({
    where: { blockerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      reason: true,
      createdAt: true,
      blocked: {
        select: { id: true, username: true, riderProfile: { select: { fullName: true, avatarUrl: true } } },
      },
    },
  });

  return rows.map((row) => ({
    userId: row.blocked.id,
    username: row.blocked.username,
    fullName: row.blocked.riderProfile?.fullName ?? row.blocked.username,
    avatarUrl: row.blocked.riderProfile?.avatarUrl ?? null,
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
  }));
}
