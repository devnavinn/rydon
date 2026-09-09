import "server-only";

import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";
import { buildDTO, getSenderInfo, UNKNOWN_SENDER } from "@/features/chat/server/queries";

export async function sendMessage(groupId: string, senderId: string, body: string) {
  const [message, senderInfo] = await Promise.all([
    prisma.message.create({ data: { groupId, senderId, body } }),
    getSenderInfo([senderId]),
  ]);

  const dto = buildDTO(message, senderInfo.get(senderId) ?? UNKNOWN_SENDER);
  publish(`group:${groupId}`, "message", dto);
  return dto;
}
