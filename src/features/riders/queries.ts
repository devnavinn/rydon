"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { RideStyle } from "@prisma/client";

import type { NearbyRider } from "@/features/riders/types";

export type NearbyRidersParams = {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  style?: RideStyle | "ALL";
};

async function fetchNearbyRiders(params: NearbyRidersParams): Promise<NearbyRider[]> {
  const search = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radiusKm: String(params.radiusKm),
  });
  if (params.style && params.style !== "ALL") search.set("style", params.style);

  const res = await fetch(`/api/nearby-riders?${search.toString()}`);
  if (!res.ok) throw new Error("Failed to load nearby riders");
  const data = await res.json();
  return data.riders as NearbyRider[];
}

export function useNearbyRiders(params: NearbyRidersParams) {
  return useQuery({
    queryKey: ["nearby-riders", params],
    queryFn: () => fetchNearbyRiders(params),
    enabled: params.lat !== null && params.lng !== null,
    refetchInterval: 20_000,
    // A real position/radius/style change still re-keys the query; keep
    // showing the last result while the new one loads instead of blanking
    // the list back to the loading state.
    placeholderData: keepPreviousData,
  });
}
