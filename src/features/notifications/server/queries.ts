import "server-only";

import { prisma } from "@/lib/prisma";
import type { NotificationDTO } from "@/features/notifications/types";
import type { Notification } from "@prisma/client";

const PAGE_SIZE = 20;

function toDTO(notification: Notification): NotificationDTO {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: (notification.data as Record<string, unknown> | null) ?? null,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function listNotifications(userId: string, cursor?: string | null) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

  return {
    notifications: page.map(toDTO),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
