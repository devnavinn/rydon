"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import type { NotificationsPage } from "@/features/notifications/types";

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
    refetchInterval: 20_000,
  });
}
