import "server-only";

import { headers } from "next/headers";

/** Best-effort origin for building absolute links (verification emails, etc.) from server code that has no `window`. */
export async function getAppUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
