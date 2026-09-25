import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { env, isProduction } from "@/lib/env";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, isReferralCode } from "@/features/referrals/constants";

const APP_PREFIX = "/dashboard";
const APP_ROUTES = [
  "/dashboard",
  "/riders",
  "/map",
  "/rides",
  "/groups",
  "/chat",
  "/notifications",
  "/profile",
  "/saved-rides",
  "/settings",
];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export default async function proxy(request: NextRequest) {
  // getToken doesn't infer the request's protocol the way the rest of Auth.js
  // does, so without this it always looks for the non-`__Secure-` cookie name
  // — which silently breaks every session check once the app is served over
  // HTTPS (real cookie is `__Secure-authjs.session-token`).
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const secureCookie = proto === "https";
  // getToken reads and verifies the NextAuth session JWT directly — edge-safe,
  // no Prisma/Node APIs, so this stays lightweight in the proxy runtime.
  const token = await getToken({ req: request, secret: env.AUTH_SECRET, secureCookie });
  const hasSession = Boolean(token);

  const response = route(request, hasSession);

  // `?ref=<code>` on shared links (e.g. a ride shared by a rider) credits that
  // rider if this visitor signs up. First invite wins — don't overwrite.
  const ref = request.nextUrl.searchParams.get("ref")?.toLowerCase();
  if (!hasSession && isReferralCode(ref) && !request.cookies.has(REFERRAL_COOKIE)) {
    response.cookies.set(REFERRAL_COOKIE, ref, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return response;
}

function route(request: NextRequest, hasSession: boolean): NextResponse {
  const { pathname } = request.nextUrl;

  const isAppRoute = APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Shared ride links (`/rides/<id>`) open the public ride page for
  // logged-out visitors instead of a sign-in wall.
  const rideMatch = pathname.match(/^\/rides\/([^/]+)$/);
  if (rideMatch && rideMatch[1] !== "create" && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = `/r/${rideMatch[1]}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAppRoute && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = APP_PREFIX;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Public pages people land on from shared links (referral capture).
    "/",
    "/r/:path*",
    "/dashboard/:path*",
    "/riders/:path*",
    "/map/:path*",
    "/rides/:path*",
    "/groups/:path*",
    "/chat/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/saved-rides/:path*",
    "/settings/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
