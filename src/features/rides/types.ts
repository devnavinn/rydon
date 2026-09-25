import type { RideStyle, RideStatus, RideVisibility, RideMemberStatus } from "@prisma/client";

export type NearbyRide = {
  id: string;
  slug: string;
  title: string;
  style: RideStyle;
  status: RideStatus;
  rideDate: string;
  meetupTime: string;
  startLocationName: string;
  startLatitude: number;
  startLongitude: number;
  destinationName: string;
  destinationLatitude: number;
  destinationLongitude: number;
  maxRiders: number;
  memberCount: number;
  distanceKm: number;
  host: { username: string; fullName: string };
};

export type RideMemberSummary = {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  status: RideMemberStatus;
  roleLabel: string | null;
};

export type RideDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  notes: string | null;
  style: RideStyle;
  status: RideStatus;
  visibility: RideVisibility;
  rideDate: string;
  meetupTime: string;
  maxRiders: number;
  minRiders: number;
  requiresApproval: boolean;
  allowPillion: boolean;
  helmetRequired: boolean;
  startLocationName: string;
  startLatitude: number;
  startLongitude: number;
  destinationName: string;
  destinationLatitude: number;
  destinationLongitude: number;
  hostId: string;
  groupId: string | null;
  groupActiveFrom: string | null;
  members: RideMemberSummary[];
};

/** What a logged-out visitor may see of a ride — no member list or host notes. */
export type PublicRide = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  style: RideStyle;
  status: RideStatus;
  visibility: RideVisibility;
  rideDate: Date;
  meetupTime: Date;
  estimatedDistanceKm: number | null;
  estimatedDurationMin: number | null;
  maxRiders: number;
  memberCount: number;
  requiresApproval: boolean;
  allowPillion: boolean;
  helmetRequired: boolean;
  startLocationName: string;
  startLatitude: number;
  startLongitude: number;
  destinationName: string;
  destinationLatitude: number;
  destinationLongitude: number;
  host: { username: string; fullName: string; avatarUrl: string | null };
};
