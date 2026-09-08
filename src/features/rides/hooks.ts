"use client";

import { useEffect, useMemo, useState } from "react";

import { haversineDistanceKm, interpolatePoint, seededSpeedKph } from "@/lib/geo";
import { usePostLocation } from "@/features/groups/hooks";
import type { RideDetail } from "@/features/rides/types";

export type MemberProgress = {
  userId: string;
  fraction: number;
  lat: number;
  lng: number;
  speedKph: number;
  etaMinutes: number | null;
  arrived: boolean;
};

/**
 * Deterministic client-side progress simulation: every viewer computes the
 * same position for a given rider from `groupActiveFrom` + a seeded speed,
 * so the ride room feels "live" without a socket server. The current user's
 * own simulated position is also persisted as a real LocationPing so the
 * group-location API/DB path is genuinely exercised.
 */
export function useRideSimulation(ride: RideDetail | undefined, currentUserId?: string) {
  const [now, setNow] = useState(() => Date.now());
  const postLocation = usePostLocation(ride?.groupId ?? null);

  const isOngoing = ride?.status === "ONGOING" && Boolean(ride.groupActiveFrom);

  useEffect(() => {
    if (!isOngoing) return;
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [isOngoing]);

  const start = useMemo(
    () => (ride ? { lat: ride.startLatitude, lng: ride.startLongitude } : null),
    [ride]
  );
  const destination = useMemo(
    () => (ride ? { lat: ride.destinationLatitude, lng: ride.destinationLongitude } : null),
    [ride]
  );
  const totalDistanceKm = start && destination ? haversineDistanceKm(start, destination) : 0;

  const progress = useMemo<Map<string, MemberProgress>>(() => {
    const map = new Map<string, MemberProgress>();
    if (!ride || !start || !destination || !ride.groupActiveFrom) return map;

    const startedAt = new Date(ride.groupActiveFrom).getTime();
    const hoursElapsed = Math.max(0, (now - startedAt) / 3_600_000);

    for (const member of ride.members) {
      if (member.status !== "JOINED") continue;
      const speedKph = seededSpeedKph(member.userId);
      const distanceCovered = speedKph * hoursElapsed;
      const fraction = totalDistanceKm > 0 ? Math.min(1, distanceCovered / totalDistanceKm) : 1;
      const point = interpolatePoint(start, destination, fraction);
      const remainingKm = totalDistanceKm * (1 - fraction);

      map.set(member.userId, {
        userId: member.userId,
        fraction,
        lat: point.lat,
        lng: point.lng,
        speedKph,
        etaMinutes: fraction < 1 ? Math.round((remainingKm / speedKph) * 60) : null,
        arrived: fraction >= 1,
      });
    }

    return map;
  }, [ride, start, destination, totalDistanceKm, now]);

  useEffect(() => {
    if (!isOngoing || !currentUserId) return;
    const self = progress.get(currentUserId);
    if (!self) return;

    postLocation.mutate({ latitude: self.lat, longitude: self.lng, speedKph: self.speedKph });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOngoing, currentUserId, Math.floor(now / 5_000)]);

  return { progress, totalDistanceKm, isOngoing };
}
