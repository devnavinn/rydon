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
