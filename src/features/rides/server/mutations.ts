import "server-only";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { CreateRideInput } from "@/features/rides/validators";

export async function createRide(hostId: string, input: CreateRideInput) {
  const base = slugify(input.title);
  let slug = base;
  let suffix = 0;
  while (true) {
    const existing = await prisma.ride.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) break;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  const rideDate = new Date(input.rideDate);
  const meetupTime = new Date(`${input.rideDate}T${input.meetupTime}`);

  const ride = await prisma.ride.create({
    data: {
      hostId,
      title: input.title,
      slug,
      description: input.description || null,
      notes: input.notes || null,
      startLocationName: input.startLocationName,
      startLatitude: input.startLatitude,
      startLongitude: input.startLongitude,
      destinationName: input.destinationName,
      destinationLatitude: input.destinationLatitude,
      destinationLongitude: input.destinationLongitude,
      rideDate,
      meetupTime,
      style: input.style,
      visibility: input.visibility,
      maxRiders: input.maxRiders,
      minRiders: input.minRiders,
      requiresApproval: input.requiresApproval,
      allowPillion: input.allowPillion,
      helmetRequired: input.helmetRequired,
      status: "PUBLISHED",
      members: {
        create: { userId: hostId, status: "JOINED", roleLabel: "captain", approvedAt: new Date() },
      },
      group: {
        create: {
          name: input.title,
          status: "PLANNED",
          members: { create: { userId: hostId, isAdmin: true } },
        },
      },
    },
    select: { id: true },
  });

  return ride;
}

async function addToGroup(rideId: string, userId: string) {
  const group = await prisma.rideGroup.findUnique({ where: { rideId }, select: { id: true } });
  if (!group) return;
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId } },
    create: { groupId: group.id, userId },
    update: {},
  });
}

export async function joinRide(rideId: string, userId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { requiresApproval: true, maxRiders: true, status: true },
  });
  if (!ride) throw new Error("Ride not found");
  if (ride.status !== "PUBLISHED" && ride.status !== "FULL") {
    throw new Error("This ride is not open to join");
  }

  const member = await prisma.rideMember.upsert({
    where: { rideId_userId: { rideId, userId } },
    create: {
      rideId,
      userId,
      status: ride.requiresApproval ? "REQUESTED" : "JOINED",
      approvedAt: ride.requiresApproval ? null : new Date(),
    },
    update: {
      status: ride.requiresApproval ? "REQUESTED" : "JOINED",
      leftAt: null,
    },
  });

  if (!ride.requiresApproval) await addToGroup(rideId, userId);

  return member;
}

export async function leaveRide(rideId: string, userId: string) {
  return prisma.rideMember.update({
    where: { rideId_userId: { rideId, userId } },
    data: { status: "LEFT", leftAt: new Date() },
  });
}

export async function setMemberStatus(
  rideId: string,
  memberId: string,
  status: "APPROVED" | "REJECTED"
) {
  const member = await prisma.rideMember.update({
    where: { id: memberId, rideId },
    data: {
      status: status === "APPROVED" ? "JOINED" : "REJECTED",
      approvedAt: status === "APPROVED" ? new Date() : null,
    },
  });

  if (status === "APPROVED") await addToGroup(rideId, member.userId);

  return member;
}

export async function startRide(rideId: string) {
  return prisma.$transaction([
    prisma.ride.update({ where: { id: rideId }, data: { status: "ONGOING" } }),
    prisma.rideGroup.update({
      where: { rideId },
      data: { status: "ACTIVE", activeFrom: new Date() },
    }),
  ]);
}

export async function endRide(rideId: string) {
  return prisma.$transaction([
    prisma.ride.update({ where: { id: rideId }, data: { status: "COMPLETED" } }),
    prisma.rideGroup.update({
      where: { rideId },
      data: { status: "ENDED", activeUntil: new Date() },
    }),
  ]);
}
