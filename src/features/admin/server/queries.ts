import "server-only";

import type { Prisma, ReportStatus, ReportTargetType, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ReportDetail, ReportListItem, ReportPerson, ReportTarget } from "@/features/reports/types";

export const ADMIN_PAGE_SIZE = 25;

const PERSON_SELECT = {
  id: true,
  username: true,
  riderProfile: { select: { fullName: true } },
} as const;

function toPerson(user: { id: string; username: string; riderProfile: { fullName: string } | null }): ReportPerson {
  return { id: user.id, username: user.username, fullName: user.riderProfile?.fullName ?? user.username };
}

export async function getAdminOverview() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [open, reviewing, resolvedThisWeek, totalUsers, suspendedUsers, newUsersThisWeek, liveRides] =
    await Promise.all([
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.report.count({ where: { status: "REVIEWING" } }),
      prisma.report.count({ where: { status: { in: ["RESOLVED", "REJECTED"] }, reviewedAt: { gte: since } } }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.ride.count({ where: { status: { in: ["PUBLISHED", "FULL", "ONGOING"] } } }),
    ]);
  return { open, reviewing, resolvedThisWeek, totalUsers, suspendedUsers, newUsersThisWeek, liveRides };
}

/** Short human label for each target, fetched in one query per type. */
async function labelTargets(reports: { targetType: ReportTargetType; targetId: string }[]) {
  const idsOf = (type: ReportTargetType) =>
    [...new Set(reports.filter((r) => r.targetType === type).map((r) => r.targetId))];

  const [users, rides, groups, messages] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: idsOf("USER") } }, select: { id: true, username: true } }),
    prisma.ride.findMany({ where: { id: { in: idsOf("RIDE") } }, select: { id: true, title: true } }),
    prisma.rideGroup.findMany({ where: { id: { in: idsOf("GROUP") } }, select: { id: true, name: true } }),
    prisma.message.findMany({
      where: { id: { in: idsOf("MESSAGE") } },
      select: { id: true, sender: { select: { username: true } } },
    }),
  ]);

  const labels = new Map<string, string>();
  for (const u of users) labels.set(`USER:${u.id}`, `@${u.username}`);
  for (const r of rides) labels.set(`RIDE:${r.id}`, r.title);
  for (const g of groups) labels.set(`GROUP:${g.id}`, g.name);
  for (const m of messages) labels.set(`MESSAGE:${m.id}`, `Message from @${m.sender.username}`);
  return (type: ReportTargetType, id: string) => labels.get(`${type}:${id}`) ?? "Deleted";
}

export async function listReports({ status, page }: { status: ReportStatus | "ALL"; page: number }) {
  const where: Prisma.ReportWhereInput = status === "ALL" ? {} : { status };
  const [rows, total] = await Promise.all([
    prisma.report.findMany({
      where,
      // Oldest first for the working queues so nothing sits forever; newest first for history.
      orderBy: { createdAt: status === "OPEN" || status === "REVIEWING" ? "asc" : "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        status: true,
        createdAt: true,
        reporter: { select: PERSON_SELECT },
      },
    }),
    prisma.report.count({ where }),
  ]);

  const [label, related] = await Promise.all([
    labelTargets(rows),
    prisma.report.groupBy({
      by: ["targetType", "targetId"],
      where: { targetId: { in: [...new Set(rows.map((r) => r.targetId))] } },
      _count: { _all: true },
    }),
  ]);
  const relatedCounts = new Map(related.map((r) => [`${r.targetType}:${r.targetId}`, r._count._all]));

  const reports: ReportListItem[] = rows.map((row) => ({
    id: row.id,
    targetType: row.targetType,
    targetId: row.targetId,
    targetLabel: label(row.targetType, row.targetId),
    reason: row.reason,
    status: row.status,
    reporter: toPerson(row.reporter),
    createdAt: row.createdAt.toISOString(),
    relatedCount: (relatedCounts.get(`${row.targetType}:${row.targetId}`) ?? 1) - 1,
  }));

  return { reports, total, pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

async function resolveTarget(type: ReportTargetType, id: string): Promise<ReportTarget> {
  switch (type) {
    case "USER": {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { ...PERSON_SELECT, isActive: true, role: true },
      });
      return user ? { type, user: { ...toPerson(user), isActive: user.isActive, role: user.role } } : { type, missing: true };
    }
    case "RIDE": {
      const ride = await prisma.ride.findUnique({
        where: { id },
        select: { id: true, title: true, status: true, host: { select: { ...PERSON_SELECT, isActive: true } } },
      });
      return ride
        ? {
            type,
            ride: { id: ride.id, title: ride.title, status: ride.status },
            host: { ...toPerson(ride.host), isActive: ride.host.isActive },
          }
        : { type, missing: true };
    }
    case "GROUP": {
      const group = await prisma.rideGroup.findUnique({ where: { id }, select: { id: true, name: true, rideId: true } });
      return group ? { type, group } : { type, missing: true };
    }
    case "MESSAGE": {
      const message = await prisma.message.findUnique({
        where: { id },
        select: {
          id: true,
          body: true,
          isDeleted: true,
          createdAt: true,
          group: { select: { rideId: true } },
          sender: { select: { ...PERSON_SELECT, isActive: true } },
        },
      });
      return message
        ? {
            type,
            message: {
              id: message.id,
              body: message.body,
              isDeleted: message.isDeleted,
              createdAt: message.createdAt.toISOString(),
              rideId: message.group.rideId,
            },
            sender: { ...toPerson(message.sender), isActive: message.sender.isActive },
          }
        : { type, missing: true };
    }
  }
}

export async function getReportDetail(id: string): Promise<ReportDetail | null> {
  const report = await prisma.report.findUnique({
    where: { id },
    select: {
      id: true,
      targetType: true,
      targetId: true,
      reason: true,
      details: true,
      status: true,
      resolutionNote: true,
      reviewedAt: true,
      createdAt: true,
      reporter: { select: PERSON_SELECT },
      reviewedBy: { select: PERSON_SELECT },
    },
  });
  if (!report) return null;

  const [target, history] = await Promise.all([
    resolveTarget(report.targetType, report.targetId),
    prisma.report.findMany({
      where: { targetType: report.targetType, targetId: report.targetId, id: { not: report.id } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, reason: true, status: true, createdAt: true },
    }),
  ]);

  return {
    id: report.id,
    targetType: report.targetType,
    targetId: report.targetId,
    reason: report.reason,
    details: report.details,
    status: report.status,
    resolutionNote: report.resolutionNote,
    reviewedAt: report.reviewedAt?.toISOString() ?? null,
    reviewedBy: report.reviewedBy ? toPerson(report.reviewedBy) : null,
    reporter: toPerson(report.reporter),
    createdAt: report.createdAt.toISOString(),
    relatedCount: history.length,
    target,
    history: history.map((h) => ({ ...h, createdAt: h.createdAt.toISOString() })),
  };
}

export type AdminUserRow = {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  reportsAgainst: number;
};

export async function listUsers({
  query,
  filter,
  page,
}: {
  query: string;
  filter: "all" | "suspended" | "staff";
  page: number;
}) {
  const where: Prisma.UserWhereInput = {
    ...(query
      ? {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { riderProfile: { fullName: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(filter === "suspended" ? { isActive: false } : {}),
    ...(filter === "staff" ? { role: { in: ["MODERATOR", "ADMIN"] } } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastSeenAt: true,
        riderProfile: { select: { fullName: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const reportCounts = await prisma.report.groupBy({
    by: ["targetId"],
    where: { targetType: "USER", targetId: { in: rows.map((r) => r.id) } },
    _count: { _all: true },
  });
  const countFor = new Map(reportCounts.map((r) => [r.targetId, r._count._all]));

  const users: AdminUserRow[] = rows.map((row) => ({
    id: row.id,
    username: row.username,
    email: row.email,
    fullName: row.riderProfile?.fullName ?? row.username,
    role: row.role,
    isActive: row.isActive,
    isVerified: row.isVerified,
    createdAt: row.createdAt.toISOString(),
    lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
    reportsAgainst: countFor.get(row.id) ?? 0,
  }));

  return { users, total, pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}
