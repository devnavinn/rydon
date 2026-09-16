import type { RiderLevel } from "@prisma/client";

/** Ordered highest to lowest. A rider qualifies for a tier by rides OR distance,
 * whichever they reach first — rewards frequent short riders and long-haul tourers alike. */
const LEVEL_TIERS: { level: RiderLevel; minRides: number; minDistanceKm: number }[] = [
  { level: "VETERAN", minRides: 80, minDistanceKm: 5000 },
  { level: "ROAD_CAPTAIN", minRides: 30, minDistanceKm: 2000 },
  { level: "EXPLORER", minRides: 10, minDistanceKm: 500 },
  { level: "CASUAL", minRides: 3, minDistanceKm: 100 },
  { level: "NEWBIE", minRides: 0, minDistanceKm: 0 },
];

export function computeRiderLevel(totalRides: number, totalDistanceKm: number): RiderLevel {
  const tier = LEVEL_TIERS.find(
    (t) => totalRides >= t.minRides || totalDistanceKm >= t.minDistanceKm
  );
  return tier?.level ?? "NEWBIE";
}

export function nextLevelProgress(totalRides: number, totalDistanceKm: number) {
  const currentIndex = LEVEL_TIERS.findIndex((t) => t.level === computeRiderLevel(totalRides, totalDistanceKm));
  const next = LEVEL_TIERS[currentIndex - 1];
  if (!next) return null;

  return {
    next: next.level,
    ridesLeft: Math.max(0, next.minRides - totalRides),
    kmLeft: Math.max(0, next.minDistanceKm - totalDistanceKm),
  };
}
