"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { CreateRideInput } from "@/features/rides/validators";

export function useUpdateRide(rideId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRideInput) => {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update ride");
      }
      return res.json() as Promise<{ ride: { id: string } }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ride", rideId] });
      router.push(`/rides/${rideId}`);
    },
  });
}

export function useCreateRide() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: CreateRideInput) => {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create ride");
      }
      return res.json() as Promise<{ ride: { id: string } }>;
    },
    onSuccess: (data) => {
      router.push(`/rides/${data.ride.id}`);
    },
  });
}

export function useJoinRide(rideId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/rides/${rideId}/join`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to join ride");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ride", rideId] }),
  });
}

export function useLeaveRide(rideId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/rides/${rideId}/leave`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to leave ride");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ride", rideId] }),
  });
}

type RideAction =
  | { action: "start" | "end" | "cancel" }
  | { action: "approve_member" | "reject_member"; memberId: string };

export function useRideAction(rideId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: RideAction) => {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Action failed");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ride", rideId] }),
  });
}
