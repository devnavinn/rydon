"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, Play, Flag as FlagIcon, MessageCircle, Pencil } from "lucide-react";

import { useRideDetail, useRoadRoute } from "@/features/rides/queries";
import { useJoinRide, useLeaveRide, useRideAction } from "@/features/rides/mutations";
import { useRideSimulation } from "@/features/rides/hooks";
import { canEditRide } from "@/features/rides/permissions";
import type { RideDetail } from "@/features/rides/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapView } from "@/components/map/map-view";
import type { MapMarker } from "@/components/map/rider-map";
import { InviteList } from "@/components/rides/invite-list";
import { ProgressPanel } from "@/components/rides/progress-panel";
import { SaveRideButton } from "@/components/rides/save-ride-button";
import { ShareLocationCard } from "@/components/rides/share-location-card";

export function RideRoom({
  rideId,
  initialRide,
  currentUserId,
  emergencySharingOn,
}: {
  rideId: string;
  initialRide: RideDetail;
  currentUserId: string;
  emergencySharingOn: boolean;
}) {
  const { data: ride } = useRideDetail(rideId, initialRide);
  const active = ride ?? initialRide;

  const isHost = active.hostId === currentUserId;
  const membership = active.members.find((m) => m.userId === currentUserId);

  const joinRide = useJoinRide(rideId);
  const leaveRide = useLeaveRide(rideId);
  const rideAction = useRideAction(rideId);
  const { progress, totalDistanceKm } = useRideSimulation(active, currentUserId);

  const roadRoute = useRoadRoute({
    fromLat: active.startLatitude,
    fromLng: active.startLongitude,
    toLat: active.destinationLatitude,
    toLng: active.destinationLongitude,
  });

  const joinedCount = active.members.filter((m) => m.status === "JOINED").length;

  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [
      {
        id: "start",
        lat: active.startLatitude,
        lng: active.startLongitude,
        kind: "start",
        label: active.startLocationName,
      },
      {
        id: "destination",
        lat: active.destinationLatitude,
        lng: active.destinationLongitude,
        kind: "destination",
        label: active.destinationName,
      },
    ];
    for (const [userId, p] of progress) {
      const member = active.members.find((m) => m.userId === userId);
      list.push({
        id: `member-${userId}`,
        lat: p.lat,
        lng: p.lng,
        kind: "riding",
        pulse: !p.arrived,
        label: member?.fullName ?? "Rider",
        sublabel: p.arrived ? "Arrived" : `${Math.round(p.speedKph)} km/h`,
      });
    }
    return list;
  }, [active, progress]);

  const rideDate = new Date(active.rideDate);
  const meetupTime = new Date(active.meetupTime);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const canStart = meetupTime.getTime() <= now;
  const canEdit = isHost && canEditRide(active, new Date(now));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl tracking-wide">{active.title}</h1>
            <Badge variant="outline">{active.style}</Badge>
            <Badge variant={active.status === "ONGOING" ? "default" : "secondary"}>
              {active.status}
            </Badge>
            <SaveRideButton rideId={rideId} />
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {rideDate.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {meetupTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {joinedCount}/{active.maxRiders} riders
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-2">
            {active.groupId && (isHost || (membership && membership.status !== "LEFT")) ? (
              <Button variant="outline" asChild>
                <Link href={`/chat/${active.groupId}`}>
                  <MessageCircle className="size-3.5" /> Chat
                </Link>
              </Button>
            ) : null}
            {canEdit ? (
              <Button variant="outline" asChild>
                <Link href={`/rides/${rideId}/edit`}>
                  <Pencil className="size-3.5" /> Edit
                </Link>
              </Button>
            ) : null}
            {isHost && (active.status === "PUBLISHED" || active.status === "FULL") ? (
              <Button
                onClick={() => rideAction.mutate({ action: "start" })}
                disabled={rideAction.isPending || !canStart}
                title={canStart ? undefined : `Can't start before ${meetupTime.toLocaleString()}`}
              >
                <Play className="size-3.5" /> Start ride
              </Button>
            ) : null}
            {isHost && active.status === "ONGOING" ? (
              <Button
                variant="outline"
                onClick={() => rideAction.mutate({ action: "end" })}
                disabled={rideAction.isPending}
              >
                <FlagIcon className="size-3.5" /> End ride
              </Button>
            ) : null}
            {!isHost && !membership ? (
              <Button onClick={() => joinRide.mutate()} disabled={joinRide.isPending}>
                {joinRide.isPending ? "Requesting..." : "Join ride"}
              </Button>
            ) : null}
            {!isHost && membership && membership.status !== "LEFT" ? (
              <Button
                variant="outline"
                onClick={() => leaveRide.mutate()}
                disabled={leaveRide.isPending}
              >
                Leave ride
              </Button>
            ) : null}
          </div>
          {isHost && !canStart && (active.status === "PUBLISHED" || active.status === "FULL") ? (
            <p className="text-xs text-muted-foreground">
              Starts {meetupTime.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </p>
          ) : null}
          {rideAction.error ? (
            <p className="text-xs text-destructive">{rideAction.error.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-xl border" style={{ height: 360 }}>
              <MapView
                center={[active.startLatitude, active.startLongitude]}
                zoom={11}
                markers={markers}
                routes={[
                  {
                    id: "route",
                    // Falls back to a straight line if routing is unavailable.
                    points: roadRoute.data ?? [
                      [active.startLatitude, active.startLongitude],
                      [active.destinationLatitude, active.destinationLongitude],
                    ],
                  },
                ]}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {active.startLocationName} → {active.destinationName}
            </p>
            {active.description ? <p className="text-sm">{active.description}</p> : null}
            {active.notes ? (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Notes: </span>
                  {active.notes}
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {isHost || (membership && membership.status !== "LEFT") ? (
            <Card>
              <CardContent>
                <ShareLocationCard rideId={rideId} emergencySharingOn={emergencySharingOn} />
              </CardContent>
            </Card>
          ) : null}

          {active.status === "ONGOING" ? (
            <Card>
              <CardContent>
                <p className="mb-2 text-sm font-medium">Live progress</p>
                <ProgressPanel ride={active} progress={progress} totalDistanceKm={totalDistanceKm} />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent>
              <p className="mb-2 text-sm font-medium">Riders</p>
              <InviteList ride={active} isHost={isHost} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
