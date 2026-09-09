"use client";

import { useQuery } from "@tanstack/react-query";

import type { BlockedUserDTO } from "@/features/blocking/types";

const QUERY_KEY = ["blocked-users"];

async function fetchBlockedUsers(): Promise<BlockedUserDTO[]> {
  const res = await fetch("/api/blocked-users");
  if (!res.ok) throw new Error("Failed to load blocked riders");
  const data = await res.json();
  return data.blockedUsers as BlockedUserDTO[];
}

export function useBlockedUsers(initialData?: BlockedUserDTO[]) {
  return useQuery({ queryKey: QUERY_KEY, queryFn: fetchBlockedUsers, initialData });
}

export function useBlockedUserIds() {
  const { data } = useBlockedUsers();
  return new Set((data ?? []).map((b) => b.userId));
}

export { QUERY_KEY as blockedUsersQueryKey };
