"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { blockedUsersQueryKey } from "@/features/blocking/queries";

export function useBlockRider(username: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/riders/${username}/block`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to block rider");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: blockedUsersQueryKey }),
  });
}

export function useUnblockRider(username: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/riders/${username}/block`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to unblock rider");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: blockedUsersQueryKey }),
  });
}
