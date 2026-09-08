import "server-only";

import { prisma } from "@/lib/prisma";

export async function getOwnProfileDetail(userId: string) {
  const [profile, bikes, emergencyContacts] = await Promise.all([
    prisma.riderProfile.findUnique({ where: { userId } }),
    prisma.bike.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    }),
    prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  if (!profile) throw new Error("RiderProfile missing for authenticated user");

  return { profile, bikes, emergencyContacts };
}
