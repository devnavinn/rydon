import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  ClubDetail,
  ClubMemberDTO,
  ClubRideDTO,
  ClubSummary,
  ClubViewerMembership,
} from "@/features/clubs/types";

const ACTIVE_UPCOMING_RIDE = {
  status: { in: ["PUBLISHED", "FULL", "ONGOING"] },
  rideDate: { gte: startOfToday() },
} satisfies Prisma.RideWhereInput;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const SUMMARY_SELECT = {
  id: true,
  slug: true,
  name: true,
  city: true,
  joinPolicy: true,
  _count: {
    select: {
      members: { where: { status: "ACTIVE" } },
      rides: { where: ACTIVE_UPCOMING_RIDE },
    },
  },
} satisfies Prisma.ClubSelect;

function toSummary(club: Prisma.ClubGetPayload<{ select: typeof SUMMARY_SELECT }>): ClubSummary {
  return {
    id: club.id,
    slug: club.slug,
    name: club.name,
    city: club.city,
    joinPolicy: club.joinPolicy,
    memberCount: club._count.members,
    upcomingRideCount: club._count.rides,
  };
}

export async function listMyClubs(userId: string): Promise<(ClubSummary & { membership: NonNullable<ClubViewerMembership> })[]> {
  const rows = await prisma.clubMember.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { joinedAt: "desc" }],
    select: { role: true, status: true, club: { select: SUMMARY_SELECT } },
  });
  return rows.map((row) => ({ ...toSummary(row.club), membership: { role: row.role, status: row.status } }));
}

/** Clubs a rider could join: listed ones they aren't in, their city first, then the biggest. */
export async function discoverClubs({
  userId,
  city,
  query,
}: {
  userId: string;
  city: string | null;
  query: string;
}): Promise<ClubSummary[]> {
  const where: Prisma.ClubWhereInput = {
    joinPolicy: { not: "INVITE_ONLY" },
    members: { none: { userId } },
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const rows = await prisma.club.findMany({
    where,
    orderBy: { members: { _count: "desc" } },
    take: 30,
    select: SUMMARY_SELECT,
  });

  const clubs = rows.map(toSummary);
  if (!city || query) return clubs;
  const local = city.toLowerCase();
  return [
    ...clubs.filter((c) => c.city?.toLowerCase() === local),
    ...clubs.filter((c) => c.city?.toLowerCase() !== local),
  ];
}

export async function getMembership(clubId: string, userId: string): Promise<ClubViewerMembership> {
  return prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId } },
    select: { role: true, status: true },
  });
}

const ROLE_ORDER = { OWNER: 0, ADMIN: 1, MEMBER: 2 } as const;

export async function getClubDetail(slug: string): Promise<ClubDetail | null> {
  const club = await prisma.club.findUnique({
    where: { slug },
    select: {
      ...SUMMARY_SELECT,
      description: true,
      inviteCode: true,
      createdAt: true,
      members: {
        orderBy: { createdAt: "asc" },
        select: {
          role: true,
          status: true,
          joinedAt: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              isActive: true,
              riderProfile: { select: { fullName: true, city: true } },
            },
          },
        },
      },
      rides: {
        where: ACTIVE_UPCOMING_RIDE,
        orderBy: { meetupTime: "asc" },
        take: 10,
        select: {
          id: true,
          title: true,
          rideDate: true,
          meetupTime: true,
          startLocationName: true,
          destinationName: true,
          maxRiders: true,
          visibility: true,
          host: { select: { username: true } },
          _count: { select: { members: { where: { status: { in: ["APPROVED", "JOINED"] } } } } },
        },
      },
    },
  });
  if (!club) return null;

  const members: ClubMemberDTO[] = club.members
    .filter((m) => m.user.isActive)
    .map((m) => ({
      userId: m.user.id,
      username: m.user.username,
      fullName: m.user.riderProfile?.fullName ?? m.user.username,
      city: m.user.riderProfile?.city ?? null,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt?.toISOString() ?? null,
      requestedAt: m.createdAt.toISOString(),
    }));

  const upcomingRides: ClubRideDTO[] = club.rides.map((r) => ({
    id: r.id,
    title: r.title,
    rideDate: r.rideDate.toISOString(),
    meetupTime: r.meetupTime.toISOString(),
    startLocationName: r.startLocationName,
    destinationName: r.destinationName,
    hostUsername: r.host.username,
    memberCount: r._count.members,
    maxRiders: r.maxRiders,
    visibility: r.visibility,
  }));

  return {
    ...toSummary(club),
    description: club.description,
    inviteCode: club.inviteCode,
    createdAt: club.createdAt.toISOString(),
    members: members
      .filter((m) => m.status === "ACTIVE")
      .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]),
    pending: members.filter((m) => m.status === "PENDING"),
    upcomingRides,
  };
}

export async function getClubByInviteCode(code: string) {
  return prisma.club.findUnique({ where: { inviteCode: code }, select: { id: true, slug: true } });
}

/** Clubs the rider can host rides for — feeds the "Host as" picker on the ride form. */
export async function listAdminClubs(userId: string) {
  const rows = await prisma.clubMember.findMany({
    where: { userId, status: "ACTIVE", role: { in: ["OWNER", "ADMIN"] } },
    orderBy: { club: { name: "asc" } },
    select: { club: { select: { id: true, slug: true, name: true } } },
  });
  return rows.map((r) => r.club);
}

export async function listPublicClubSlugs() {
  return prisma.club.findMany({
    where: { joinPolicy: { not: "INVITE_ONLY" } },
    select: { slug: true, updatedAt: true },
  });
}
