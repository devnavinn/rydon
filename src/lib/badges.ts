import type { RideStyle, RiderLevel } from "@prisma/client";

export type BadgeContext = {
  totalRides: number;
  totalDistanceKm: number;
  level: RiderLevel;
  ridesHosted: number;
  ride: { style: RideStyle; distanceKm: number };
};

export type BadgeDefinition = {
  code: string;
  label: string;
  description: string;
  /** Name of a lucide-react icon component, resolved by the badge shelf UI. */
  icon: string;
  check: (ctx: BadgeContext) => boolean;
};

export const BADGES: BadgeDefinition[] = [
  {
    code: "FIRST_RIDE",
    label: "First Ride",
    description: "Completed your first ride.",
    icon: "Flag",
    check: (c) => c.totalRides >= 1,
  },
  {
    code: "TEN_RIDES",
    label: "Regular",
    description: "Completed 10 rides.",
    icon: "Repeat",
    check: (c) => c.totalRides >= 10,
  },
  {
    code: "CENTURY",
    label: "Century Rider",
    description: "Rode 100+ km in a single ride.",
    icon: "Gauge",
    check: (c) => c.ride.distanceKm >= 100,
  },
  {
    code: "THOUSAND_CLUB",
    label: "1000km Club",
    description: "Crossed 1,000 total km ridden.",
    icon: "Trophy",
    check: (c) => c.totalDistanceKm >= 1000,
  },
  {
    code: "FIVE_THOUSAND_CLUB",
    label: "5000km Club",
    description: "Crossed 5,000 total km ridden.",
    icon: "Award",
    check: (c) => c.totalDistanceKm >= 5000,
  },
  {
    code: "NIGHT_RIDER",
    label: "Night Rider",
    description: "Completed a night ride.",
    icon: "Moon",
    check: (c) => c.ride.style === "NIGHT",
  },
  {
    code: "EARLY_BIRD",
    label: "Early Bird",
    description: "Completed a breakfast ride.",
    icon: "Coffee",
    check: (c) => c.ride.style === "BREAKFAST",
  },
  {
    code: "OFFROAD_EXPLORER",
    label: "Offroad Explorer",
    description: "Completed an offroad ride.",
    icon: "Mountain",
    check: (c) => c.ride.style === "OFFROAD",
  },
  {
    code: "FOR_A_CAUSE",
    label: "For a Cause",
    description: "Completed a charity ride.",
    icon: "HeartHandshake",
    check: (c) => c.ride.style === "CHARITY",
  },
  {
    code: "ROAD_CAPTAIN_STRIPES",
    label: "Road Captain",
    description: "Reached Road Captain level.",
    icon: "ShieldCheck",
    check: (c) => c.level === "ROAD_CAPTAIN" || c.level === "VETERAN",
  },
  {
    code: "VETERAN",
    label: "Veteran",
    description: "Reached Veteran level.",
    icon: "Crown",
    check: (c) => c.level === "VETERAN",
  },
  {
    code: "PACK_LEADER",
    label: "Pack Leader",
    description: "Hosted 5 or more rides.",
    icon: "Users",
    check: (c) => c.ridesHosted >= 5,
  },
];

export const BADGE_BY_CODE = new Map(BADGES.map((b) => [b.code, b]));

export function evaluateNewBadges(ctx: BadgeContext, alreadyEarnedCodes: Set<string>): BadgeDefinition[] {
  return BADGES.filter((b) => !alreadyEarnedCodes.has(b.code) && b.check(ctx));
}
