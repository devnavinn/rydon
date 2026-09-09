"use client";

import { useState } from "react";
import { ShieldOff, ShieldX } from "lucide-react";

import { useBlockRider, useUnblockRider } from "@/features/blocking/mutations";
import { Button } from "@/components/ui/button";

export function BlockButton({
  username,
  initiallyBlocked,
}: {
  username: string;
  initiallyBlocked: boolean;
}) {
  const [isBlocked, setIsBlocked] = useState(initiallyBlocked);
  const block = useBlockRider(username);
  const unblock = useUnblockRider(username);

  function handleClick() {
    if (isBlocked) {
      setIsBlocked(false);
      unblock.mutate(undefined, { onError: () => setIsBlocked(true) });
    } else {
      if (!window.confirm(`Block @${username}? You won't see each other in discovery or be able to join each other's rides.`)) {
        return;
      }
      setIsBlocked(true);
      block.mutate(undefined, { onError: () => setIsBlocked(false) });
    }
  }

  return (
    <Button
      type="button"
      variant={isBlocked ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={block.isPending || unblock.isPending}
    >
      {isBlocked ? (
        <>
          <ShieldOff className="size-3.5" /> Blocked
        </>
      ) : (
        <>
          <ShieldX className="size-3.5" /> Block
        </>
      )}
    </Button>
  );
}
