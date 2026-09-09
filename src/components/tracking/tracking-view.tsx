"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { MapPinned } from "lucide-react";

import { usePublicPosition } from "@/features/tracking/queries";
import type { PublicTrackingInfo } from "@/features/tracking/types";
import { MapView } from "@/components/map/map-view";
import type { MapMarker } from "@/components/map/rider-map";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TrackingView({ token, info }: { token: string; info: PublicTrackingInfo }) {
  const isLive = info.rideStatus === "ONGOING";
  const { data: position } = usePublicPosition(token, isLive);

  const markers: MapMarker[] = position
    ? [
        {
          id: "rider",
          lat: position.latitude,
          lng: position.longitude,
          kind: "riding",
          pulse: true,
          label: info.riderFullName,
          sublabel: position.speedKph ? `${Math.round(position.speedKph)} km/h` : undefined,
        },
      ]
    : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <MapPinned className="size-5 text-primary" />
        <h1 className="font-heading text-2xl tracking-wide">{info.riderFullName}</h1>
        <Badge variant={isLive ? "default" : "secondary"}>
          {isLive
            ? "Live"
            : info.rideStatus === "COMPLETED" || info.rideStatus === "CANCELLED"
              ? "Ride ended"
              : "Not started yet"}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {info.rideTitle} · {info.startLocationName} → {info.destinationName}
      </p>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-xl" style={{ height: 400 }}>
            {position ? (
              <MapView center={[position.latitude, position.longitude]} zoom={13} markers={markers} />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
                {isLive
                  ? "Waiting for the first location update..."
                  : "The map will appear once this ride is underway."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {position ? (
        <p className="text-xs text-muted-foreground">
          Updated {formatDistanceToNowStrict(new Date(position.recordedAt), { addSuffix: true })}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        This link was shared by {info.riderFullName} and expires{" "}
        {formatDistanceToNowStrict(new Date(info.expiresAt), { addSuffix: true })}.
      </p>
    </div>
  );
}
