"use client";

import { useQuery, useMutation } from "@tanstack/react-query";

import type { MemberPosition } from "@/features/groups/types";

async function fetchPositions(groupId: string): Promise<MemberPosition[]> {
  const res = await fetch(`/api/groups/${groupId}/location`);
  if (!res.ok) throw new Error("Failed to load positions");
  const data = await res.json();
  return data.positions as MemberPosition[];
}

export function useGroupLivePositions(groupId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["group-positions", groupId],
    queryFn: () => fetchPositions(groupId as string),
    enabled: Boolean(groupId) && enabled,
    refetchInterval: 3_000,
  });
}

export function usePostLocation(groupId: string | null) {
  return useMutation({
    mutationFn: async (position: { latitude: number; longitude: number; speedKph?: number }) => {
      if (!groupId) return;
      await fetch(`/api/groups/${groupId}/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(position),
      });
    },
  });
}
