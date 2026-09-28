import { z } from "zod";

import { CLUB_JOIN_POLICIES } from "@/lib/enums";

export const clubSchema = z.object({
  name: z.string().trim().min(3, "At least 3 characters").max(60),
  description: z.string().trim().max(1000).optional(),
  city: z.string().trim().max(80).optional(),
  joinPolicy: z.enum(CLUB_JOIN_POLICIES),
});

export type ClubInput = z.infer<typeof clubSchema>;
