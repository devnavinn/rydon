"use client";

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import type { ChatMessageDTO, ChatMessagesPage } from "@/features/chat/types";

type CurrentUser = { id: string; username: string; fullName: string; avatarUrl: string | null };

function upsertMessage(
  current: InfiniteData<ChatMessagesPage> | undefined,
  message: ChatMessageDTO,
  replaceId?: string
): InfiniteData<ChatMessagesPage> | undefined {
  if (!current) return current;
  const [newestPage, ...rest] = current.pages;
  const withoutReplaced = replaceId
    ? newestPage.messages.filter((m) => m.id !== replaceId)
    : newestPage.messages;
  if (withoutReplaced.some((m) => m.id === message.id)) return current;
  return {
    ...current,
    pages: [{ ...newestPage, messages: [...withoutReplaced, message] }, ...rest],
  };
}

/**
 * Sending a message round-trips through auth + membership checks + the
 * insert, which can take a couple of seconds on a high-latency database
 * connection. The composer can't wait on that without feeling broken, so the
 * message is rendered optimistically under a temporary `temp-*` id and
 * reconciled with the server row once the request (or the SSE echo of it,
 * whichever arrives first — see useMessagesStream) comes back.
 */
export function useSendMessage(groupId: string, currentUser: CurrentUser) {
  const queryClient = useQueryClient();
  const queryKey = ["chat-messages", groupId];

  return useMutation({
    mutationFn: async ({ body, clientId }: { body: string; clientId: string }) => {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      return { message: data.message as ChatMessageDTO, clientId };
    },
    onMutate: ({ body, clientId }) => {
      const optimistic: ChatMessageDTO = {
        id: clientId,
        groupId,
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        senderFullName: currentUser.fullName,
        senderAvatarUrl: currentUser.avatarUrl,
        body,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(queryKey, (current) =>
        upsertMessage(current, optimistic)
      );
    },
    onSuccess: ({ message, clientId }) => {
      queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(queryKey, (current) =>
        upsertMessage(current, message, clientId)
      );
    },
    onError: (_error, { clientId }) => {
      queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(queryKey, (current) => {
        if (!current) return current;
        const [newestPage, ...rest] = current.pages;
        return {
          ...current,
          pages: [
            { ...newestPage, messages: newestPage.messages.filter((m) => m.id !== clientId) },
            ...rest,
          ],
        };
      });
    },
  });
}
