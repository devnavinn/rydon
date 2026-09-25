import { NextResponse, type NextRequest } from "next/server";

import { isProduction } from "@/lib/env";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, isReferralCode } from "@/features/referrals/constants";

/** Invite link: remembers who invited this visitor, then sends them to sign up. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const response = NextResponse.redirect(new URL("/sign-up", request.url));

  const normalized = code.toLowerCase();
  if (isReferralCode(normalized)) {
    response.cookies.set(REFERRAL_COOKIE, normalized, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: "/",
    });
  }
  return response;
}
