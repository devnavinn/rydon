import type { ClubRole } from "@prisma/client";

import type { ClubViewerMembership } from "@/features/clubs/types";

export function isClubAdmin(membership: ClubViewerMembership): boolean {
  return membership?.status === "ACTIVE" && (membership.role === "OWNER" || membership.role === "ADMIN");
}

/**
 * Admins manage regular members; only the owner manages admins. Nobody
 * manages the owner, and nobody uses these controls on themselves.
 */
export function canManageMember(actorRole: ClubRole, targetRole: ClubRole): boolean {
  if (targetRole === "OWNER") return false;
  if (actorRole === "OWNER") return true;
  return actorRole === "ADMIN" && targetRole === "MEMBER";
}
