import "server-only";

import type { ReportTargetType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CreateReportInput } from "@/features/reports/validators";

const DAILY_REPORT_LIMIT = 10;

export class ReportError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

/** The user a report is ultimately about, or null if the target doesn't exist. */
async function resolveTargetOwner(type: ReportTargetType, id: string): Promise<string | null> {
  switch (type) {
    case "USER": {
      const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
      return user?.id ?? null;
    }
    case "RIDE": {
      const ride = await prisma.ride.findUnique({ where: { id }, select: { hostId: true } });
      return ride?.hostId ?? null;
    }
    case "GROUP": {
      const group = await prisma.rideGroup.findUnique({ where: { id }, select: { ride: { select: { hostId: true } } } });
      return group?.ride.hostId ?? null;
    }
    case "MESSAGE": {
      const message = await prisma.message.findUnique({ where: { id }, select: { senderId: true } });
      return message?.senderId ?? null;
    }
  }
}

export async function createReport(reporterId: string, input: CreateReportInput) {
  const ownerId = await resolveTargetOwner(input.targetType, input.targetId);
  if (!ownerId) throw new ReportError("That no longer exists", 404);
  if (ownerId === reporterId) throw new ReportError("You can't report yourself", 400);

  // Re-reporting the same thing while it's still in the queue is a no-op, not a new ticket.
  const existing = await prisma.report.findFirst({
    where: {
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      status: { in: ["OPEN", "REVIEWING"] },
    },
    select: { id: true },
  });
  if (existing) return existing;

  const recent = await prisma.report.count({
    where: { reporterId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  if (recent >= DAILY_REPORT_LIMIT) {
    throw new ReportError("You've sent a lot of reports today — our team is on it", 429);
  }

  return prisma.report.create({
    data: {
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      details: input.details || null,
    },
    select: { id: true },
  });
}
