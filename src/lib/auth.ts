import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/features/auth/types";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isVerified: true,
      riderProfile: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          city: true,
          latitude: true,
          longitude: true,
          profileCompleted: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    riderProfile: user.riderProfile
      ? {
          id: user.riderProfile.id,
          fullName: user.riderProfile.fullName,
          avatarUrl: user.riderProfile.avatarUrl,
          city: user.riderProfile.city,
          latitude: user.riderProfile.latitude ? Number(user.riderProfile.latitude) : null,
          longitude: user.riderProfile.longitude ? Number(user.riderProfile.longitude) : null,
          profileCompleted: user.riderProfile.profileCompleted,
        }
      : null,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
