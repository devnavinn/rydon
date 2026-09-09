"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import type { NotificationDTO, NotificationsPage } from "@/features/notifications/types";

async function fetchNotifications(cursor?: string | null): Promise<NotificationsPage> {
  const search = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const res = await fetch(`/api/notifications${search}`);
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

export function useNotifications(initialData?: NotificationsPage) {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => fetchNotifications(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? { pages: [initialData], pageParams: [null] }
      : undefined,
    // Push delivers new notifications instantly; this is just a safety net
    // in case the SSE connection drops without reconnecting.
    refetchInterval: 60_000,
  });
}

export function useNotificationsStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource("/api/notifications/stream");

    source.addEventListener("notification", (event) => {
      const notification = JSON.parse((event as MessageEvent<string>).data) as NotificationDTO;

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(["notifications"], (current) => {
        if (!current) return current;
        const [firstPage, ...rest] = current.pages;
        return {
          ...current,
          pages: [
            {
              ...firstPage,
              notifications: [notification, ...firstPage.notifications],
              unreadCount: firstPage.unreadCount + 1,
            },
            ...rest,
          ],
        };
      });
    });

    return () => source.close();
  }, [queryClient]);
}
