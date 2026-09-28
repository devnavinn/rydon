import "server-only";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { CLUB_INVITE_COOKIE, isClubInviteCode } from "@/features/clubs/constants";
import { joinClub } from "@/features/clubs/server/mutations";

/**
 * Joins the club whose invite link brought this rider to Rydo (cookie set by
 * /clubs/join/<code>). Called once onboarding is done. Returns the club slug
 * so onboarding can land them on it.
 */
export async function claimClubInvite(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const code = cookieStore.get(CLUB_INVITE_COOKIE)?.value;
  if (!isClubInviteCode(code)) return null;
  cookieStore.delete(CLUB_INVITE_COOKIE);

  const club = await prisma.club.findUnique({ where: { inviteCode: code }, select: { id: true, slug: true } });
  if (!club) return null;

  await joinClub(club.id, userId, code);
  return club.slug;
}
