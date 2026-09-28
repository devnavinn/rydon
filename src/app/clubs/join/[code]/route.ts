import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { isProduction } from "@/lib/env";
import {
  CLUB_INVITE_COOKIE,
  CLUB_INVITE_COOKIE_MAX_AGE,
  clubPath,
  isClubInviteCode,
  publicClubPath,
} from "@/features/clubs/constants";
import { getClubByInviteCode } from "@/features/clubs/server/queries";

/**
 * Club invite link. Riders already on Rydo land on the club page with the
 * invite applied; everyone else sees the public club page, and the cookie
 * auto-joins them once they finish onboarding.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toLowerCase();
  const club = isClubInviteCode(code) ? await getClubByInviteCode(code) : null;
  if (!club) return NextResponse.redirect(new URL("/clubs", request.url));

  const session = await auth();
  if (session?.user?.id) {
    return NextResponse.redirect(new URL(`${clubPath(club.slug)}?invite=${code}`, request.url));
  }

  const response = NextResponse.redirect(new URL(`${publicClubPath(club.slug)}?invite=${code}`, request.url));
  response.cookies.set(CLUB_INVITE_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: CLUB_INVITE_COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
