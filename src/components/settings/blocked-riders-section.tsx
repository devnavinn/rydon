"use client";

import Link from "next/link";

import { useBlockedUsers } from "@/features/blocking/queries";
import { useUnblockRider } from "@/features/blocking/mutations";
import type { BlockedUserDTO } from "@/features/blocking/types";
import { Button } from "@/components/ui/button";

function UnblockRow({ blocked }: { blocked: BlockedUserDTO }) {
  const unblock = useUnblockRider(blocked.username);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-3 py-2">
      <Link href={`/riders/${blocked.username}`} className="min-w-0 hover:underline">
        <p className="truncate text-sm font-medium">{blocked.fullName}</p>
        <p className="truncate text-xs text-muted-foreground">@{blocked.username}</p>
      </Link>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => unblock.mutate()}
        disabled={unblock.isPending}
        className="shrink-0"
      >
        Unblock
      </Button>
    </div>
  );
}

export function BlockedRidersSection({ initialData }: { initialData: BlockedUserDTO[] }) {
  const { data: blockedUsers = [] } = useBlockedUsers(initialData);

  if (blockedUsers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You haven&apos;t blocked anyone. Blocked riders won&apos;t see you in discovery and can&apos;t
        join each other&apos;s rides.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {blockedUsers.map((blocked) => (
        <UnblockRow key={blocked.userId} blocked={blocked} />
      ))}
    </div>
  );
}
