import type { ClubJoinPolicy, ClubMemberStatus, ClubRole, RideVisibility } from "@prisma/client";

export type ClubSummary = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  joinPolicy: ClubJoinPolicy;
  memberCount: number;
  upcomingRideCount: number;
};

export type ClubMemberDTO = {
  userId: string;
  username: string;
  fullName: string;
  city: string | null;
  role: ClubRole;
  status: ClubMemberStatus;
  joinedAt: string | null;
  requestedAt: string;
};

export type ClubRideDTO = {
  id: string;
  title: string;
  rideDate: string;
  meetupTime: string;
  startLocationName: string;
  destinationName: string;
  hostUsername: string;
  memberCount: number;
  maxRiders: number;
  visibility: RideVisibility;
};

export type ClubViewerMembership = { role: ClubRole; status: ClubMemberStatus } | null;

export type ClubDetail = ClubSummary & {
  description: string | null;
  inviteCode: string;
  createdAt: string;
  members: ClubMemberDTO[];
  pending: ClubMemberDTO[];
  upcomingRides: ClubRideDTO[];
};
