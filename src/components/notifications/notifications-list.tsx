"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { Bell } from "lucide-react";

import { useNotifications } from "@/features/notifications/queries";
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/mutations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NotificationDTO, NotificationsPage } from "@/features/notifications/types";

function notificationHref(notification: NotificationDTO) {
  const data = notification.data as { rideId?: string; username?: string } | null;
  if (data?.rideId) return `/rides/${data.rideId}`;
  if (data?.username) return `/riders/${data.username}`;
  return null;
}

export function NotificationsList({ initialData }: { initialData: NotificationsPage }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications(initialData);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        </p>
        {unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            Mark all read
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Bell className="size-8" />
            <p className="text-sm">Ride invites and updates will show up here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col p-0">
            {notifications.map((notification, index) => {
              const href = notificationHref(notification);
              const content = (
                <div className="flex w-full items-start gap-3 px-4 py-3 text-left">
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      notification.isRead ? "bg-transparent" : "bg-primary"
                    )}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        notification.isRead && "text-muted-foreground"
                      )}
                    >
                      {notification.title}
                    </p>
                    {notification.body ? (
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );

              return (
                <div key={notification.id}>
                  {index > 0 ? <div className="h-px bg-border" /> : null}
                  {href ? (
                    <Link
                      href={href}
                      onClick={() => {
                        if (!notification.isRead) markRead.mutate(notification.id);
                      }}
                      className="block transition-colors hover:bg-muted/50"
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!notification.isRead) markRead.mutate(notification.id);
                      }}
                      className="block w-full transition-colors hover:bg-muted/50"
                    >
                      {content}
                    </button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {hasNextPage ? (
        <Button
          variant="outline"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="self-center"
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}
