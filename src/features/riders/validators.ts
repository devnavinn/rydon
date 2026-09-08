import { z } from "zod";
import { RideStyle } from "@prisma/client";

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "At least 2 characters").max(60),
  city: z.string().min(2).max(60).optional().or(z.literal("")),
  ridingStyle: z.enum(RideStyle).optional(),
  preferredRadiusKm: z.coerce.number().int().min(1).max(200).default(25),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  bikeBrand: z.string().min(1, "Enter your bike's brand").max(40),
  bikeModel: z.string().min(1, "Enter your bike's model").max(40),
  bikeYear: z.coerce.number().int().min(1950).max(2100).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const nearbyRidersQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().int().min(1).max(300).default(25),
  style: z.enum(RideStyle).optional(),
});

export type NearbyRidersQuery = z.infer<typeof nearbyRidersQuerySchema>;
