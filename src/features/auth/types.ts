import type { UserRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  riderProfile: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    profileCompleted: boolean;
  } | null;
};
