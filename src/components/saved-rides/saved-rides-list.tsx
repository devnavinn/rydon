"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";

import { useSavedRides } from "@/features/saved-rides/queries";
import { SaveRideButton } from "@/components/rides/save-ride-button";
import type { SavedRideSummary } from "@/features/saved-rides/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SavedRidesList({ initialData }: { initialData: SavedRideSummary[] }) {
  const { data: savedRides = [] } = useSavedRides(initialData);

  if (savedRides.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
        <Bookmark className="size-8" />
        <p className="text-sm">No saved rides yet. Bookmark one from the rides list.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {savedRides.map((ride) => (
        <Link key={ride.savedRideId} href={`/rides/${ride.id}`}>
          <Card className="transition-colors hover:bg-muted/40">
            <CardContent className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{ride.title}</p>
                <SaveRideButton rideId={ride.id} className="-my-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                {ride.startLocationName} → {ride.destinationName}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{ride.style}</Badge>
                <Badge variant={ride.status === "ONGOING" ? "default" : "secondary"}>
                  {ride.status === "ONGOING" ? "Live now" : ride.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {ride.memberCount}/{ride.maxRiders} riders · hosted by {ride.host.fullName}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
