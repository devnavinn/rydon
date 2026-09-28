import { z } from "zod";

import { REPORT_STATUSES, REPORT_TARGET_TYPES } from "@/lib/enums";

export const REPORT_REASONS = [
  "Harassment or abuse",
  "Unsafe riding",
  "Spam or scam",
  "Fake profile",
  "Inappropriate content",
  "Other",
] as const;

export const createReportSchema = z.object({
  targetType: z.enum(REPORT_TARGET_TYPES),
  targetId: z.string().min(1).max(64),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const reviewReportSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(REPORT_STATUSES),
  note: z.string().trim().max(1000).optional(),
});
