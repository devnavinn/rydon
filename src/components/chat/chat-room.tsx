"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Send } from "lucide-react";

import { useMessages, useMessagesStream, flattenMessages } from "@/features/chat/queries";
import { useSendMessage } from "@/features/chat/mutations";
import type { ChatMessagesPage } from "@/features/chat/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ChatRoom({
  groupId,
  currentUser,
  initialData,
}: {
  groupId: string;
  currentUser: { id: string; username: string; fullName: string; avatarUrl: string | null };
  initialData: ChatMessagesPage;
}) {
  const currentUserId = currentUser.id;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(
    groupId,
    initialData
  );
  useMessagesStream(groupId, currentUserId);
  const sendMessage = useSendMessage(groupId, currentUser);

  const messages = flattenMessages(data);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages.at(-1)?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    sendMessage.mutate({ body, clientId: `temp-${crypto.randomUUID()}` });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {hasNextPage ? (
          <Button
            variant="outline"
            size="sm"
            className="self-center"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load earlier messages"}
          </Button>
        ) : null}

        {messages.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No messages yet. Say hello to the group.
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}
              >
                <Avatar size="sm">
                  <AvatarFallback>{message.senderFullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={cn("flex max-w-[75%] flex-col gap-0.5", isOwn && "items-end")}>
                  {!isOwn ? (
                    <span className="px-1 text-xs font-medium text-muted-foreground">
                      {message.senderFullName}
                    </span>
                  ) : null}
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words",
                      isOwn
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted"
                    )}
                  >
                    {message.body}
                  </div>
                  <span className="px-1 text-[11px] text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-white/5 p-3"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message the group..."
          maxLength={2000}
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || sendMessage.isPending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
