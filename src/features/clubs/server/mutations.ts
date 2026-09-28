import "server-only";

import { randomInt } from "node:crypto";
import { Prisma, type ClubRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { createNotifications } from "@/features/notifications/server/mutations";
import { CLUB_INVITE_ALPHABET, CLUB_INVITE_CODE_LENGTH } from "@/features/clubs/constants";
import { canManageMember } from "@/features/clubs/permissions";
import type { ClubInput } from "@/features/clubs/validators";

export class ClubError extends Error {}

// Static segments under /clubs — a club with one of these slugs would be unreachable.
const RESERVED_SLUGS = new Set(["join", "new"]);

function randomInviteCode() {
  let code = "";
  for (let i = 0; i < CLUB_INVITE_CODE_LENGTH; i++) {
    code += CLUB_INVITE_ALPHABET[randomInt(CLUB_INVITE_ALPHABET.length)];
  }
  return code;
}

async function uniqueSlug(name: string) {
  const base = slugify(name) === "ride" ? "club" : slugify(name);
  let slug = RESERVED_SLUGS.has(base) ? `${base}-club` : base;
  for (let suffix = 1; await prisma.club.findUnique({ where: { slug }, select: { id: true } }); suffix++) {
    slug = `${base}-${suffix}`;
  }
  return slug;
}

/** Retries on the (astronomically rare) invite-code collision. */
async function withFreshInviteCode<T>(fn: (code: string) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(randomInviteCode());
    } catch (error) {
      const collided =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        String(error.meta?.target ?? "").includes("inviteCode");
      if (!collided || attempt >= 4) throw error;
    }
  }
}

export async function createClub(ownerId: string, input: ClubInput) {
  const slug = await uniqueSlug(input.name);
  return withFreshInviteCode((inviteCode) =>
    prisma.club.create({
      data: {
        slug,
        inviteCode,
        name: input.name,
        description: input.description || null,
        city: input.city || null,
        joinPolicy: input.joinPolicy,
        members: { create: { userId: ownerId, role: "OWNER", status: "ACTIVE", joinedAt: new Date() } },
      },
      select: { id: true, slug: true },
    })
  );
}

/** The acting rider's active membership, or a ClubError if they can't manage the club. */
async function requireClubAdmin(clubId: string, actorId: string) {
  const actor = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId: actorId } },
    select: { role: true, status: true },
  });
  if (!actor || actor.status !== "ACTIVE" || actor.role === "MEMBER") {
    throw new ClubError("Only club admins can do that");
  }
  return actor;
}

export async function updateClub(clubId: string, actorId: string, input: ClubInput) {
  await requireClubAdmin(clubId, actorId);
  return prisma.club.update({
    where: { id: clubId },
    data: {
      name: input.name,
      description: input.description || null,
      city: input.city || null,
      joinPolicy: input.joinPolicy,
    },
    select: { slug: true },
  });
}

export async function deleteClub(clubId: string, actorId: string) {
  const actor = await requireClubAdmin(clubId, actorId);
  if (actor.role !== "OWNER") throw new ClubError("Only the owner can delete the club");
  // Club rides survive as regular rides (Ride.clubId is SET NULL).
  await prisma.club.delete({ where: { id: clubId } });
}

export async function regenerateInviteCode(clubId: string, actorId: string) {
  await requireClubAdmin(clubId, actorId);
  await withFreshInviteCode((inviteCode) => prisma.club.update({ where: { id: clubId }, data: { inviteCode } }));
}

export type JoinResult = "joined" | "requested";

/**
 * Joins directly when the club is open or the rider has its current invite
 * code; otherwise files a request for the admins.
 */
export async function joinClub(clubId: string, userId: string, inviteCode?: string | null): Promise<JoinResult> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { name: true, slug: true, joinPolicy: true, inviteCode: true },
  });
  if (!club) throw new ClubError("Club not found");

  const hasInvite = Boolean(inviteCode) && inviteCode === club.inviteCode;
  if (club.joinPolicy === "INVITE_ONLY" && !hasInvite) {
    throw new ClubError("This club is invite only — ask an admin for the link");
  }
  const joinsNow = hasInvite || club.joinPolicy === "OPEN";

  const existing = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId } },
    select: { status: true },
  });
  if (existing?.status === "ACTIVE") return "joined";
  if (existing?.status === "PENDING" && !joinsNow) return "requested";

  await prisma.clubMember.upsert({
    where: { clubId_userId: { clubId, userId } },
    create: { clubId, userId, status: joinsNow ? "ACTIVE" : "PENDING", joinedAt: joinsNow ? new Date() : null },
    update: { status: "ACTIVE", joinedAt: new Date() },
  });

  if (!joinsNow) await notifyAdminsOfRequest(clubId, userId, club);
  return joinsNow ? "joined" : "requested";
}

async function notifyAdminsOfRequest(clubId: string, userId: string, club: { name: string; slug: string }) {
  const [admins, requester] = await Promise.all([
    prisma.clubMember.findMany({
      where: { clubId, status: "ACTIVE", role: { in: ["OWNER", "ADMIN"] } },
      select: { userId: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, riderProfile: { select: { fullName: true } } },
    }),
  ]);
  const name = requester?.riderProfile?.fullName ?? requester?.username ?? "A rider";
  await createNotifications(
    admins.map((admin) => ({
      userId: admin.userId,
      type: "CLUB_JOIN_REQUEST" as const,
      title: `${name} wants to join ${club.name}`,
      body: "Review the request from the club page.",
      data: { clubSlug: club.slug },
    }))
  );
}

export async function leaveClub(clubId: string, userId: string) {
  const membership = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId } },
    select: { role: true },
  });
  if (!membership) return;
  if (membership.role === "OWNER") {
    throw new ClubError("Hand ownership to another admin before leaving, or delete the club");
  }
  await prisma.clubMember.delete({ where: { clubId_userId: { clubId, userId } } });
}

async function loadTarget(clubId: string, targetId: string) {
  const target = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId: targetId } },
    select: { role: true, status: true },
  });
  if (!target) throw new ClubError("They're not in this club");
  return target;
}

export async function approveMember(clubId: string, actorId: string, targetId: string) {
  await requireClubAdmin(clubId, actorId);
  const target = await loadTarget(clubId, targetId);
  if (target.status === "ACTIVE") return;

  const [, club] = await prisma.$transaction([
    prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId: targetId } },
      data: { status: "ACTIVE", joinedAt: new Date() },
    }),
    prisma.club.findUniqueOrThrow({ where: { id: clubId }, select: { name: true, slug: true } }),
  ]);
  await createNotifications([
    {
      userId: targetId,
      type: "CLUB_JOINED",
      title: `You're in — welcome to ${club.name}`,
      body: "Your request to join was approved. Check out the club's upcoming rides.",
      data: { clubSlug: club.slug },
    },
  ]);
}

/** Kicks a member, or declines a pending request. */
export async function removeMember(clubId: string, actorId: string, targetId: string) {
  if (actorId === targetId) throw new ClubError("Use Leave club instead");
  const actor = await requireClubAdmin(clubId, actorId);
  const target = await loadTarget(clubId, targetId);
  if (!canManageMember(actor.role, target.role)) throw new ClubError("You can't remove that member");
  await prisma.clubMember.delete({ where: { clubId_userId: { clubId, userId: targetId } } });
}

/** Promote/demote between ADMIN and MEMBER, or (owner only) hand over ownership. */
export async function setMemberRole(clubId: string, actorId: string, targetId: string, role: ClubRole) {
  if (actorId === targetId) throw new ClubError("You can't change your own role");
  const actor = await requireClubAdmin(clubId, actorId);
  const target = await loadTarget(clubId, targetId);
  if (target.status !== "ACTIVE") throw new ClubError("Approve them first");

  if (role === "OWNER") {
    if (actor.role !== "OWNER") throw new ClubError("Only the owner can hand over ownership");
    await prisma.$transaction([
      prisma.clubMember.update({ where: { clubId_userId: { clubId, userId: targetId } }, data: { role: "OWNER" } }),
      prisma.clubMember.update({ where: { clubId_userId: { clubId, userId: actorId } }, data: { role: "ADMIN" } }),
    ]);
    return;
  }

  // Changing someone to/from ADMIN is managing an admin — owner only.
  if (actor.role !== "OWNER") throw new ClubError("Only the owner can change admin roles");
  if (!canManageMember(actor.role, target.role)) throw new ClubError("You can't change that member's role");
  await prisma.clubMember.update({ where: { clubId_userId: { clubId, userId: targetId } }, data: { role } });
}
