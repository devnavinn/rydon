import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1).default("Rydo <onboarding@resend.dev>"),
  // Optional — "Continue with Google" only shows when both are set.
  AUTH_GOOGLE_ID: z.string().min(1).optional(),
  AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || undefined,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || undefined,
});

export const googleAuthEnabled = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);

export const isProduction = process.env.NODE_ENV === "production";
