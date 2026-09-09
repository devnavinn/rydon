import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/riders/status-pill";
import { formatDistanceKm } from "@/lib/geo";
import type { NearbyRider } from "@/features/riders/types";

export function RiderCard({ rider }: { rider: NearbyRider }) {
  const initials = rider.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link href={`/riders/${rider.username}`}>
      <Card className="transition-colors hover:bg-muted/40">
        <CardContent className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1">
                <p className="truncate font-medium">{rider.fullName}</p>
                {rider.isVerified ? (
                  <BadgeCheck className="size-3.5 shrink-0 text-primary" aria-label="Verified" />
                ) : null}
              </span>
              <span className="shrink-0 text-sm font-medium text-muted-foreground">
                {formatDistanceKm(rider.distanceKm)}
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {rider.bike ? `${rider.bike.brand} ${rider.bike.model}` : "No bike listed"}
              {rider.city ? ` · ${rider.city}` : ""}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusPill status={rider.status} />
              {rider.ridingStyle ? (
                <Badge variant="outline">{rider.ridingStyle}</Badge>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
