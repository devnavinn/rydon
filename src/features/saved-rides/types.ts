import type { RideStyle, RideStatus } from "@prisma/client";

export type SavedRideSummary = {
  savedRideId: string;
  savedAt: string;
  id: string;
  slug: string;
  title: string;
  style: RideStyle;
  status: RideStatus;
  rideDate: string;
  meetupTime: string;
  startLocationName: string;
  destinationName: string;
  maxRiders: number;
  memberCount: number;
  host: { username: string; fullName: string };
};
