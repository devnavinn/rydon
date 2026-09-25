/**
 * Validates a post-auth `next` redirect target. Only same-origin relative
 * paths are allowed — `//evil.com` and `/\evil.com` are protocol-relative
 * in browsers, so they'd turn sign-in into an open redirect.
 */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}
