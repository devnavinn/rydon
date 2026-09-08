import { z } from "zod";

import { RIDE_STYLES } from "@/lib/enums";

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "At least 2 characters").max(60),
  bio: z.string().max(280, "Keep it under 280 characters").optional().or(z.literal("")),
  city: z.string().min(2).max(60).optional().or(z.literal("")),
  state: z.string().min(2).max(60).optional().or(z.literal("")),
  country: z.string().min(2).max(60).optional().or(z.literal("")),
  ridingStyle: z.enum(RIDE_STYLES).optional(),
  preferredRadiusKm: z.coerce.number().int().min(1).max(200).default(25),
  yearsRiding: z.coerce.number().int().min(0).max(80).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const bikeSchema = z.object({
  brand: z.string().min(1, "Enter the brand").max(40),
  model: z.string().min(1, "Enter the model").max(40),
  variant: z.string().max(40).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1950).max(2100).optional(),
  registrationNo: z.string().max(20).optional().or(z.literal("")),
  engineCc: z.coerce.number().int().min(0).max(10000).optional(),
  color: z.string().max(30).optional().or(z.literal("")),
});

export type BikeInput = z.infer<typeof bikeSchema>;

export const emergencyContactSchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(60),
  phone: z.string().min(6, "Enter a valid phone number").max(20),
  relation: z.string().max(30).optional().or(z.literal("")),
});

export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

export const MAX_EMERGENCY_CONTACTS = 5;
