"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { trackingLinkQueryKey } from "@/features/tracking/queries";
import type { TrackingLinkDTO } from "@/features/tracking/types";

export function useShareLocation(rideId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<TrackingLinkDTO> => {
      const res = await fetch(`/api/rides/${rideId}/tracking-link`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to create tracking link");
      const data = await res.json();
      return data.link;
    },
    onSuccess: (link) => {
      queryClient.setQueryData(trackingLinkQueryKey(rideId), link);
    },
  });
}

export function useStopSharing(rideId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/rides/${rideId}/tracking-link`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to stop sharing");
    },
    onSuccess: () => {
      queryClient.setQueryData(trackingLinkQueryKey(rideId), null);
    },
  });
}
