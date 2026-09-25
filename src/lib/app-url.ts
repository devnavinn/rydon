import "server-only";

import { headers } from "next/headers";

import { env } from "@/lib/env";

/**
 * Origin for building absolute links (emails, share/SEO URLs) from server code
 * that has no `window`. Prefers the configured `APP_URL` — the Host header is
 * client-controlled, so a spoofed one could otherwise put an attacker's domain
 * into password-reset emails.
 */
export async function getAppUrl(): Promise<string> {
  if (env.APP_URL) return env.APP_URL;
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
