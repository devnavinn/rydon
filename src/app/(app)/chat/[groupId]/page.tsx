import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { isGroupMember, getGroupHeader } from "@/features/groups/server/queries";
import { listMessages } from "@/features/chat/server/queries";
import { ChatRoom } from "@/components/chat/chat-room";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const [group, isMember] = await Promise.all([
    getGroupHeader(groupId),
    isGroupMember(groupId, user.id),
  ]);
  if (!group || !isMember) notFound();

  const initialData = await listMessages(groupId);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <Link
          href={`/rides/${group.rideId}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="font-heading text-lg tracking-wide">{group.name}</h1>
      </div>
      <ChatRoom
        groupId={groupId}
        currentUser={{
          id: user.id,
          username: user.username,
          fullName: user.riderProfile?.fullName ?? user.username,
          avatarUrl: user.riderProfile?.avatarUrl ?? null,
        }}
        initialData={initialData}
      />
    </div>
  );
}
