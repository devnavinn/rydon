/**
 * Plain string-literal mirrors of the Prisma enums we validate against in
 * zod schemas. `@prisma/client`'s generated enums are real runtime objects,
 * so importing them (as a value, not `import type`) anywhere reachable from
 * a Client Component pulls the whole Prisma client into the browser bundle
 * and breaks production builds. These arrays give zod the same runtime
 * values without that dependency. Keep in sync with prisma/schema.prisma.
 */

export const RIDE_STYLES = [
  "CITY",
  "BREAKFAST",
  "HIGHWAY",
  "WEEKEND",
  "OFFROAD",
  "TOURING",
  "CHARITY",
  "NIGHT",
] as const;

export const RIDE_VISIBILITIES = ["PUBLIC", "FOLLOWERS", "INVITE_ONLY"] as const;

export const USER_ROLES = ["USER", "MODERATOR", "ADMIN"] as const;

export const REPORT_TARGET_TYPES = ["USER", "RIDE", "GROUP", "MESSAGE"] as const;

export const REPORT_STATUSES = ["OPEN", "REVIEWING", "RESOLVED", "REJECTED"] as const;

export const CLUB_JOIN_POLICIES = ["OPEN", "APPROVAL", "INVITE_ONLY"] as const;
