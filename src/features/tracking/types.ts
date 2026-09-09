import type { RideStatus } from "@prisma/client";

export type TrackingLinkDTO = {
  token: string;
  expiresAt: string;
};

export type PublicTrackingInfo = {
  rideTitle: string;
  rideStatus: RideStatus;
  riderFullName: string;
  riderAvatarUrl: string | null;
  startLocationName: string;
  destinationName: string;
  expiresAt: string;
};

export type LivePosition = {
  latitude: number;
  longitude: number;
  speedKph: number | null;
  recordedAt: string;
};
