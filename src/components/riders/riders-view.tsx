"use client";

import { Loader2, MapPinOff } from "lucide-react";

import { useGeolocation, type GeoPosition } from "@/hooks/use-geolocation";
import { useNearbyRiders } from "@/features/riders/queries";
import { useDiscoveryStore } from "@/store/discovery-store";
import { RiderCard } from "@/components/riders/rider-card";
import { RadiusFilter } from "@/components/riders/radius-filter";

export function RidersView({ fallback }: { fallback: GeoPosition | null }) {
  const { position, status } = useGeolocation(fallback);
  const { radiusKm, style } = useDiscoveryStore();

  const { data: riders, isLoading } = useNearbyRiders({
    lat: position?.lat ?? null,
    lng: position?.lng ?? null,
    radiusKm,
    style,
  });

  return (
    <div className="flex flex-col gap-4">
      <RadiusFilter />

      {!position ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <MapPinOff className="size-6" />
          <p className="text-sm">
            {status === "denied"
              ? "Location access denied. Go to Settings → Location to sync your location and see nearby riders."
              : "Locating you..."}
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Finding riders nearby...</span>
        </div>
      ) : riders && riders.length > 0 ? (
        <div className="flex flex-col gap-2">
          {riders.map((rider) => (
            <RiderCard key={rider.userId} rider={rider} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p className="text-sm">No riders in this radius yet. Try widening it.</p>
        </div>
      )}
    </div>
  );
}
