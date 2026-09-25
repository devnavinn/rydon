import { z } from "zod";

import { RIDE_STYLES, RIDE_VISIBILITIES } from "@/lib/enums";

export const nearbyRidesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().int().min(1).max(300).default(25),
});

export type NearbyRidesQuery = z.infer<typeof nearbyRidesQuerySchema>;

export const createRideSchema = z
  .object({
    title: z.string().min(3, "At least 3 characters").max(80),
    description: z.string().max(1000).optional().or(z.literal("")),
    notes: z.string().max(1000).optional().or(z.literal("")),
    startLocationName: z.string().min(2, "Give the meetup point a name").max(120),
    startLatitude: z.number().min(-90).max(90),
    startLongitude: z.number().min(-180).max(180),
    destinationName: z.string().min(2, "Give the destination a name").max(120),
    destinationLatitude: z.number().min(-90).max(90),
    destinationLongitude: z.number().min(-180).max(180),
    rideDate: z.string().min(1, "Pick a date"),
    meetupTime: z.string().min(1, "Pick a time"),
    style: z.enum(RIDE_STYLES),
    visibility: z.enum(RIDE_VISIBILITIES).default("PUBLIC"),
    maxRiders: z.number().int().min(2).max(200).default(10),
    minRiders: z.number().int().min(1).max(200).default(2),
    requiresApproval: z.boolean().default(true),
    allowPillion: z.boolean().default(false),
    helmetRequired: z.boolean().default(true),
  })
  .refine((data) => data.maxRiders >= data.minRiders, {
    message: "Max riders must be at least the min riders",
    path: ["maxRiders"],
  });

/** Submitted/output shape — defaults applied. Used by the API route and the mutation. */
export type CreateRideInput = z.output<typeof createRideSchema>;
/** Raw form shape — fields with a default are optional until submit. */
export type CreateRideFormInput = z.input<typeof createRideSchema>;

export const rideStatusUpdateSchema = z.object({
  action: z.enum(["start", "end", "cancel", "approve_member", "reject_member"]),
  memberId: z.string().optional(),
});

export const directionsQuerySchema = z.object({
  fromLat: z.coerce.number().min(-90).max(90),
  fromLng: z.coerce.number().min(-180).max(180),
  toLat: z.coerce.number().min(-90).max(90),
  toLng: z.coerce.number().min(-180).max(180),
});
