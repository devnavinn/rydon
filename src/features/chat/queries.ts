"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import type { ChatMessageDTO, ChatMessagesPage } from "@/features/chat/types";

async function fetchMessages(groupId: string, cursor?: string | null): Promise<ChatMessagesPage> {
  const search = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const res = await fetch(`/api/groups/${groupId}/messages${search}`);
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export function useMessages(groupId: string, initialData?: ChatMessagesPage) {
  return useInfiniteQuery({
    queryKey: ["chat-messages", groupId],
    queryFn: ({ pageParam }) => fetchMessages(groupId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData ? { pages: [initialData], pageParams: [null] } : undefined,
  });
}

/** Pages arrive newest-first; flatten oldest-to-newest for chronological display. */
export function flattenMessages(data: InfiniteData<ChatMessagesPage> | undefined): ChatMessageDTO[] {
  if (!data) return [];
  return data.pages
    .slice()
    .reverse()
    .flatMap((page) => page.messages);
}

export function useMessagesStream(groupId: string, currentUserId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource(`/api/groups/${groupId}/stream`);

    source.addEventListener("message", (event) => {
      const message = JSON.parse((event as MessageEvent<string>).data) as ChatMessageDTO;

      queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
        ["chat-messages", groupId],
        (current) => {
          if (!current) return current;
          const [newestPage, ...rest] = current.pages;
          if (newestPage.messages.some((m) => m.id === message.id)) return current;

          // If this is the SSE echo of a message we just sent optimistically,
          // replace the temp entry instead of appending a duplicate — the
          // POST response and this event can arrive in either order.
          const optimisticMatch =
            message.senderId === currentUserId
              ? newestPage.messages.find((m) => m.id.startsWith("temp-") && m.body === message.body)
              : undefined;
          const messages = optimisticMatch
            ? newestPage.messages.filter((m) => m.id !== optimisticMatch.id)
            : newestPage.messages;

          return { ...current, pages: [{ ...newestPage, messages: [...messages, message] }, ...rest] };
        }
      );
    });

    return () => source.close();
  }, [groupId, currentUserId, queryClient]);
}
