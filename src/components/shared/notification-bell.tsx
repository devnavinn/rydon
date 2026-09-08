"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { useNotifications } from "@/features/notifications/queries";
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/mutations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { NotificationDTO } from "@/features/notifications/types";

function notificationHref(notification: NotificationDTO) {
  const rideId = (notification.data as { rideId?: string } | null)?.rideId;
  return rideId ? `/rides/${rideId}` : "/notifications";
}

export function NotificationBell() {
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const latest = data?.pages[0]?.notifications.slice(0, 6) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {latest.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          latest.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              asChild
              onSelect={() => {
                if (!notification.isRead) markRead.mutate(notification.id);
              }}
            >
              <Link
                href={notificationHref(notification)}
                className="flex flex-col items-start gap-0.5 whitespace-normal"
              >
                <span className="flex w-full items-center gap-1.5">
                  {!notification.isRead ? (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  ) : null}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      notification.isRead && "text-muted-foreground"
                    )}
                  >
                    {notification.title}
                  </span>
                </span>
                {notification.body ? (
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {notification.body}
                  </span>
                ) : null}
                <span className="text-[11px] text-muted-foreground">
                  {formatDistanceToNowStrict(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-sm text-primary">
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
