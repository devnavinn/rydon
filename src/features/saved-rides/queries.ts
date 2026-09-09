"use client";

import { useQuery } from "@tanstack/react-query";

import type { SavedRideSummary } from "@/features/saved-rides/types";

const QUERY_KEY = ["saved-rides"];

async function fetchSavedRides(): Promise<SavedRideSummary[]> {
  const res = await fetch("/api/saved-rides");
  if (!res.ok) throw new Error("Failed to load saved rides");
  const data = await res.json();
  return data.savedRides as SavedRideSummary[];
}

export function useSavedRides(initialData?: SavedRideSummary[]) {
  return useQuery({ queryKey: QUERY_KEY, queryFn: fetchSavedRides, initialData });
}

/** Cheap membership check for showing filled/outline bookmark state on any ride card. */
export function useIsRideSaved(rideId: string) {
  const { data } = useSavedRides();
  return Boolean(data?.some((saved) => saved.id === rideId));
}

export { QUERY_KEY as savedRidesQueryKey };
