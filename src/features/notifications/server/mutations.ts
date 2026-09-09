import "server-only";

import { prisma } from "@/lib/prisma";
import type { NotificationType, Prisma } from "@prisma/client";

import { publish } from "@/lib/realtime";
import { toDTO } from "@/features/notifications/server/queries";

export type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Prisma.InputJsonValue;
};

export async function createNotification(input: NotificationInput) {
  const notification = await prisma.notification.create({ data: input });
  publish(`user:${input.userId}`, "notification", toDTO(notification));
  return notification;
}

export async function createNotifications(inputs: NotificationInput[]) {
  if (inputs.length === 0) return [];
  const notifications = await prisma.$transaction(
    inputs.map((input) => prisma.notification.create({ data: input }))
  );
  for (const notification of notifications) {
    publish(`user:${notification.userId}`, "notification", toDTO(notification));
  }
  return notifications;
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
