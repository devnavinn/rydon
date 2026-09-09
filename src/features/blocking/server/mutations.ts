import "server-only";

import { prisma } from "@/lib/prisma";

export async function blockUser(blockerId: string, blockedId: string, reason?: string) {
  if (blockerId === blockedId) throw new Error("You can't block yourself");

  await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    create: { blockerId, blockedId, reason },
    update: {},
  });
}

export async function unblockUser(blockerId: string, blockedId: string) {
  await prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
}
