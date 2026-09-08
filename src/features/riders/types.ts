import type { RideStyle, RiderLevel } from "@prisma/client";

export type RiderStatus = "online" | "riding" | "offline";

export type NearbyRider = {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  city: string | null;
  ridingStyle: RideStyle | null;
  level: RiderLevel;
  distanceKm: number;
  latitude: number;
  longitude: number;
  status: RiderStatus;
  bike: { brand: string; model: string; year: number | null } | null;
};
