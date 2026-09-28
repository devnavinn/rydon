import type { UserRole } from "@prisma/client";

/** Moderators and admins can work the report queue and suspend riders. */
export function isStaff(role: UserRole): boolean {
  return role === "MODERATOR" || role === "ADMIN";
}

/** Only admins can change roles or act on other staff accounts. */
export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}
