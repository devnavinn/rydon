import "server-only";

import { prisma } from "@/lib/prisma";

export async function saveRide(userId: string, rideId: string) {
  await prisma.savedRide.upsert({
    where: { userId_rideId: { userId, rideId } },
    create: { userId, rideId },
    update: {},
  });
}

export async function unsaveRide(userId: string, rideId: string) {
  await prisma.savedRide.deleteMany({ where: { userId, rideId } });
}
