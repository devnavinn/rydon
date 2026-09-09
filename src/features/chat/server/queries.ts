import "server-only";

import { prisma } from "@/lib/prisma";
import type { ChatMessageDTO } from "@/features/chat/types";

const PAGE_SIZE = 30;

type MessageRow = { id: string; groupId: string; senderId: string; body: string | null; createdAt: Date };
type SenderInfo = { username: string; fullName: string; avatarUrl: string | null };

const UNKNOWN_SENDER: SenderInfo = { username: "unknown", fullName: "Unknown rider", avatarUrl: null };

export function buildDTO(message: MessageRow, sender: SenderInfo): ChatMessageDTO {
  return {
    id: message.id,
    groupId: message.groupId,
    senderId: message.senderId,
    senderUsername: sender.username,
    senderFullName: sender.fullName,
    senderAvatarUrl: sender.avatarUrl,
    body: message.body ?? "",
    createdAt: message.createdAt.toISOString(),
  };
}

/**
 * Two flat, single-round-trip queries instead of a `Message -> User ->
 * RiderProfile` nested `include`. That relation is two levels deep, which
 * makes Prisma resolve it as several sequential queries per call — cheap on
 * a local DB, but on a high-latency connection each extra round trip is a
 * few hundred ms, and it compounds badly on the send path where it runs on
 * every message.
 */
export async function getSenderInfo(senderIds: string[]): Promise<Map<string, SenderInfo>> {
  const uniqueIds = Array.from(new Set(senderIds));
  const [users, profiles] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: uniqueIds } }, select: { id: true, username: true } }),
    prisma.riderProfile.findMany({
      where: { userId: { in: uniqueIds } },
      select: { userId: true, fullName: true, avatarUrl: true },
    }),
  ]);

  const profileByUserId = new Map(profiles.map((p) => [p.userId, p]));
  return new Map(
    users.map((u) => {
      const profile = profileByUserId.get(u.id);
      return [
        u.id,
        { username: u.username, fullName: profile?.fullName ?? u.username, avatarUrl: profile?.avatarUrl ?? null },
      ];
    })
  );
}

export async function listMessages(groupId: string, cursor?: string | null) {
  const rows = await prisma.message.findMany({
    where: { groupId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, groupId: true, senderId: true, body: true, createdAt: true },
  });

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const senderInfo = await getSenderInfo(page.map((m) => m.senderId));

  return {
    messages: page.map((m) => buildDTO(m, senderInfo.get(m.senderId) ?? UNKNOWN_SENDER)).reverse(),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export { UNKNOWN_SENDER };
