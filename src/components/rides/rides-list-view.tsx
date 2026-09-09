"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { useGeolocation, type GeoPosition } from "@/hooks/use-geolocation";
import { useNearbyRides } from "@/features/rides/queries";
import { useDiscoveryStore } from "@/store/discovery-store";
import { RadiusFilter } from "@/components/riders/radius-filter";
import { SaveRideButton } from "@/components/rides/save-ride-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceKm } from "@/lib/geo";

export function RidesListView({ fallback }: { fallback: GeoPosition | null }) {
  const { position } = useGeolocation(fallback);
  const { radiusKm } = useDiscoveryStore();

  const { data: rides, isLoading } = useNearbyRides({
    lat: position?.lat ?? null,
    lng: position?.lng ?? null,
    radiusKm,
  });

  return (
    <div className="flex flex-col gap-4">
      <RadiusFilter />

      {!position || isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Finding rides nearby...</span>
        </div>
      ) : rides && rides.length > 0 ? (
        <div className="flex flex-col gap-2">
          {rides.map((ride) => (
            <Link key={ride.id} href={`/rides/${ride.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{ride.title}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceKm(ride.distanceKm)}
                      </span>
                      <SaveRideButton rideId={ride.id} className="-my-2" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ride.startLocationName} → {ride.destinationName}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{ride.style}</Badge>
                    <Badge variant={ride.status === "ONGOING" ? "default" : "secondary"}>
                      {ride.status === "ONGOING" ? "Live now" : "Upcoming"}
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
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p className="text-sm">No rides in this radius yet.</p>
        </div>
      )}
    </div>
  );
}
