"use client";

import { useQuery } from "@tanstack/react-query";

import type { TrackingLinkDTO, PublicTrackingInfo, LivePosition } from "@/features/tracking/types";

export function trackingLinkQueryKey(rideId: string) {
  return ["tracking-link", rideId];
}

export function useTrackingLink(rideId: string) {
  return useQuery({
    queryKey: trackingLinkQueryKey(rideId),
    queryFn: async (): Promise<TrackingLinkDTO | null> => {
      const res = await fetch(`/api/rides/${rideId}/tracking-link`);
      if (!res.ok) throw new Error("Failed to load tracking link");
      const data = await res.json();
      return data.link;
    },
  });
}

export function usePublicTrackingInfo(token: string) {
  return useQuery({
    queryKey: ["public-tracking-info", token],
    queryFn: async (): Promise<PublicTrackingInfo> => {
      const res = await fetch(`/api/track/${token}`);
      if (!res.ok) throw new Error("This tracking link is no longer valid.");
      const data = await res.json();
      return data.info;
    },
    retry: false,
  });
}

export function usePublicPosition(token: string, enabled: boolean) {
  return useQuery({
    queryKey: ["public-tracking-position", token],
    queryFn: async (): Promise<LivePosition | null> => {
      const res = await fetch(`/api/track/${token}/position`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.position;
    },
    enabled,
    refetchInterval: 5_000,
  });
}
