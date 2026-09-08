"use client";

import { Check, X, Crown } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRideAction } from "@/features/rides/mutations";
import type { RideDetail } from "@/features/rides/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  JOINED: "default",
  REQUESTED: "secondary",
  REJECTED: "destructive",
  LEFT: "outline",
};

export function InviteList({ ride, isHost }: { ride: RideDetail; isHost: boolean }) {
  const rideAction = useRideAction(ride.id);

  const members = [...ride.members].sort((a, b) => {
    const order = ["JOINED", "REQUESTED", "REJECTED", "LEFT"];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-2.5 rounded-lg border p-2.5">
          <Avatar className="size-8">
            <AvatarFallback>{member.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-sm font-medium">
              {member.fullName}
              {member.roleLabel === "captain" ? (
                <Crown className="size-3.5 text-amber-500" />
              ) : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{member.username}</p>
          </div>
          <Badge variant={STATUS_VARIANT[member.status] ?? "outline"}>{member.status}</Badge>
          {isHost && member.status === "REQUESTED" ? (
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Approve"
                disabled={rideAction.isPending}
                onClick={() =>
                  rideAction.mutate({ action: "approve_member", memberId: member.id })
                }
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Reject"
                disabled={rideAction.isPending}
                onClick={() =>
                  rideAction.mutate({ action: "reject_member", memberId: member.id })
                }
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
