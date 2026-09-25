"use client";

import { useQuery } from "@tanstack/react-query";

import type { NearbyRide, RideDetail } from "@/features/rides/types";

export type NearbyRidesParams = {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
};

async function fetchNearbyRides(params: NearbyRidesParams): Promise<NearbyRide[]> {
  const search = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radiusKm: String(params.radiusKm),
  });
  const res = await fetch(`/api/rides?${search.toString()}`);
  if (!res.ok) throw new Error("Failed to load nearby rides");
  const data = await res.json();
  return data.rides as NearbyRide[];
}

export function useNearbyRides(params: NearbyRidesParams) {
  return useQuery({
    queryKey: ["nearby-rides", params],
    queryFn: () => fetchNearbyRides(params),
    enabled: params.lat !== null && params.lng !== null,
    refetchInterval: 20_000,
  });
}

async function fetchRideDetail(rideId: string): Promise<RideDetail> {
  const res = await fetch(`/api/rides/${rideId}`);
  if (!res.ok) throw new Error("Failed to load ride");
  const data = await res.json();
  return data.ride as RideDetail;
}

export function useRideDetail(rideId: string, initialData?: RideDetail) {
  return useQuery({
    queryKey: ["ride", rideId],
    queryFn: () => fetchRideDetail(rideId),
    initialData,
    refetchInterval: 8_000,
  });
}

export type RoadRouteParams = {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
};

async function fetchRoadRoute(params: RoadRouteParams): Promise<[number, number][]> {
  const search = new URLSearchParams({
    fromLat: String(params.fromLat),
    fromLng: String(params.fromLng),
    toLat: String(params.toLat),
    toLng: String(params.toLng),
  });
  const res = await fetch(`/api/directions?${search.toString()}`);
  if (!res.ok) throw new Error("Failed to load route");
  const data = await res.json();
  return data.points as [number, number][];
}

/** Road path between two points; stays cached since start/destination rarely change. */
export function useRoadRoute(params: RoadRouteParams) {
  return useQuery({
    queryKey: ["road-route", params],
    queryFn: () => fetchRoadRoute(params),
    staleTime: Infinity,
    retry: 1,
  });
}
