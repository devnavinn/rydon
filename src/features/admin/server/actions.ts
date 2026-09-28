"use server";

import { revalidatePath } from "next/cache";
import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { USER_ROLES } from "@/lib/enums";
import { isAdmin, isStaff } from "@/lib/permissions";
import { reviewReportSchema } from "@/features/reports/validators";
import { createNotification } from "@/features/notifications/server/mutations";
import type { ActionState } from "@/features/auth/server/actions";
import type { SessionUser } from "@/features/auth/types";

// Every action re-checks the caller's role: server actions are public endpoints,
// and bound arguments (user ids, report ids) come back from the client untrusted.
async function assertStaff(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) throw new Error("Forbidden");
  return user;
}

const ok: ActionState = { error: null };

/** Moderators can act on riders; only admins can act on other staff. Nobody acts on themselves. */
async function checkCanModerate(actor: SessionUser, targetId: string): Promise<string | null> {
  if (actor.id === targetId) return "You can't do that to your own account";
  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { role: true } });
  if (!target) return "User not found";
  if (isStaff(target.role) && !isAdmin(actor.role)) return "Only admins can act on staff accounts";
  return null;
}

export async function reviewReportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await assertStaff();
  const parsed = reviewReportSchema.safeParse({
    reportId: formData.get("reportId"),
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { reportId, status, note } = parsed.data;

  const report = await prisma.report.findUnique({ where: { id: reportId }, select: { status: true, reporterId: true } });
  if (!report) return { error: "Report not found" };

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolutionNote: note ?? null,
      reviewedById: status === "OPEN" ? null : actor.id,
      reviewedAt: status === "OPEN" ? null : new Date(),
    },
  });

  // Close the loop with the reporter once, when the report first reaches a verdict.
  const wasClosed = report.status === "RESOLVED" || report.status === "REJECTED";
  if (!wasClosed && (status === "RESOLVED" || status === "REJECTED")) {
    await createNotification({
      userId: report.reporterId,
      type: "SYSTEM",
      title: status === "RESOLVED" ? "We acted on your report" : "We reviewed your report",
      body:
        status === "RESOLVED"
          ? "Thanks for looking out for other riders — our team has taken action."
          : "Thanks for flagging this. We looked into it and didn't find a rules violation.",
      data: { reportId },
    });
  }

  revalidatePath("/admin", "layout");
  return ok;
}

export async function suspendUserAction(userId: string): Promise<ActionState> {
  const actor = await assertStaff();
  const denied = await checkCanModerate(actor, userId);
  if (denied) return { error: denied };

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { isActive: false } }),
    // Don't leave a suspended rider broadcasting their location to live links.
    prisma.trackingLink.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);

  revalidatePath("/admin", "layout");
  return ok;
}

export async function reactivateUserAction(userId: string): Promise<ActionState> {
  const actor = await assertStaff();
  const denied = await checkCanModerate(actor, userId);
  if (denied) return { error: denied };

  await prisma.user.update({ where: { id: userId }, data: { isActive: true } });

  revalidatePath("/admin", "layout");
  return ok;
}

export async function setUserRoleAction(userId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await assertStaff();
  if (!isAdmin(actor.role)) return { error: "Only admins can change roles" };
  if (actor.id === userId) return { error: "You can't change your own role" };

  const role = formData.get("role");
  if (!USER_ROLES.includes(role as UserRole)) return { error: "Invalid role" };

  await prisma.user.update({ where: { id: userId }, data: { role: role as UserRole } });

  revalidatePath("/admin", "layout");
  return ok;
}

export async function removeMessageAction(messageId: string): Promise<ActionState> {
  await assertStaff();
  await prisma.message.updateMany({ where: { id: messageId }, data: { isDeleted: true } });

  revalidatePath("/admin", "layout");
  return ok;
}

export async function cancelRideAction(rideId: string): Promise<ActionState> {
  await assertStaff();
  const ride = await prisma.ride.findUnique({ where: { id: rideId }, select: { hostId: true, title: true, status: true } });
  if (!ride) return { error: "Ride not found" };
  if (ride.status === "CANCELLED" || ride.status === "COMPLETED") return { error: `Ride is already ${ride.status.toLowerCase()}` };

  await prisma.ride.update({ where: { id: rideId }, data: { status: "CANCELLED", cancelledAt: new Date() } });
  await createNotification({
    userId: ride.hostId,
    type: "SYSTEM",
    title: "Your ride was cancelled by moderators",
    body: `"${ride.title}" was taken down for breaking Rydo's community rules.`,
    data: { rideId },
  });

  revalidatePath("/admin", "layout");
  return ok;
}
