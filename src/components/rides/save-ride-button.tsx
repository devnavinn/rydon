"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";

import { useIsRideSaved, savedRidesQueryKey } from "@/features/saved-rides/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveRideButton({ rideId, className }: { rideId: string; className?: string }) {
  const queryClient = useQueryClient();
  const isSaved = useIsRideSaved(rideId);
  // Optimistic override so the icon flips instantly rather than waiting on
  // the request + a full saved-rides refetch.
  const [pendingState, setPendingState] = useState<boolean | null>(null);

  const toggle = useMutation({
    mutationFn: async (nextSaved: boolean) => {
      const res = await fetch(`/api/rides/${rideId}/save`, {
        method: nextSaved ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Failed to update saved ride");
    },
    onSettled: async () => {
      // Wait for the refetch this triggers before dropping the optimistic
      // override — otherwise there's a gap where the cache still holds the
      // pre-toggle state and the button flickers back before catching up.
      await queryClient.invalidateQueries({ queryKey: savedRidesQueryKey });
      setPendingState(null);
    },
  });

  const shown = pendingState ?? isSaved;

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const next = !shown;
    setPendingState(next);
    toggle.mutate(next);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      className={className}
      aria-label={shown ? "Unsave ride" : "Save ride"}
      aria-pressed={shown}
    >
      <Bookmark className={cn("size-4", shown && "fill-current text-primary")} />
    </Button>
  );
}
