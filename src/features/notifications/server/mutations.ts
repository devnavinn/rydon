import "server-only";

import { prisma } from "@/lib/prisma";
import type { NotificationType, Prisma } from "@prisma/client";

export type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Prisma.InputJsonValue;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function createNotifications(inputs: NotificationInput[]) {
  if (inputs.length === 0) return { count: 0 };
  return prisma.notification.createMany({ data: inputs });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}
