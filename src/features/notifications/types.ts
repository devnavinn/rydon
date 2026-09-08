import type { NotificationType } from "@prisma/client";

export type NotificationDTO = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsPage = {
  notifications: NotificationDTO[];
  nextCursor: string | null;
  unreadCount: number;
};
