"use client";

import { useMemo } from "react";
import Link from "next/link";

import { useGeolocation, type GeoPosition } from "@/hooks/use-geolocation";
import { useNearbyRiders } from "@/features/riders/queries";
import { useNearbyRides } from "@/features/rides/queries";
import { useDiscoveryStore } from "@/store/discovery-store";
import { RadiusFilter } from "@/components/riders/radius-filter";
import { MapView } from "@/components/map/map-view";
import type { MapMarker } from "@/components/map/rider-map";
import { Badge } from "@/components/ui/badge";
import { formatDistanceKm } from "@/lib/geo";

export function MapExplorer({ fallback }: { fallback: GeoPosition | null }) {
  const { position } = useGeolocation(fallback);
  const { radiusKm, style } = useDiscoveryStore();

  const { data: riders } = useNearbyRiders({
    lat: position?.lat ?? null,
    lng: position?.lng ?? null,
    radiusKm,
    style,
  });
  const { data: rides } = useNearbyRides({
    lat: position?.lat ?? null,
    lng: position?.lng ?? null,
    radiusKm,
  });

  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [];
    if (position) {
      list.push({ id: "self", lat: position.lat, lng: position.lng, kind: "self", label: "You" });
    }
    for (const rider of riders ?? []) {
      list.push({
        id: `rider-${rider.userId}`,
        lat: rider.latitude,
        lng: rider.longitude,
        kind: rider.status,
        pulse: rider.status === "riding",
        label: rider.fullName,
        sublabel: rider.bike ? `${rider.bike.brand} ${rider.bike.model}` : undefined,
      });
    }
    for (const ride of rides ?? []) {
      list.push({
        id: `ride-${ride.id}`,
        lat: ride.startLatitude,
        lng: ride.startLongitude,
        kind: "ride",
        label: ride.title,
        sublabel: `${ride.style} · hosted by ${ride.host.fullName}`,
      });
    }
    return list;
  }, [position, riders, rides]);

  if (!position) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        Waiting for your location...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <RadiusFilter />
      <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border lg:col-span-2" style={{ minHeight: 420 }}>
          <MapView center={[position.lat, position.lng]} markers={markers} zoom={11} />
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto rounded-xl border p-3" style={{ maxHeight: 480 }}>
          <p className="text-sm font-medium text-muted-foreground">Rides nearby</p>
          {rides && rides.length > 0 ? (
            rides.map((ride) => (
              <Link
                key={ride.id}
                href={`/rides/${ride.id}`}
                className="flex flex-col gap-1 rounded-lg border p-2.5 text-sm transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{ride.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceKm(ride.distanceKm)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{ride.style}</Badge>
                  <Badge variant={ride.status === "ONGOING" ? "default" : "secondary"}>
                    {ride.status === "ONGOING" ? "Live now" : "Upcoming"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {ride.memberCount}/{ride.maxRiders} riders · from {ride.startLocationName}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No rides in this radius yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
