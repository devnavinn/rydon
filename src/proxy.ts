import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { env } from "@/lib/env";

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
  const { pathname } = request.nextUrl;
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

  const isAppRoute = APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAppRoute && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
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
