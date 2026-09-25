import "server-only";

import { prisma } from "@/lib/prisma";

type GoogleIdentity = {
  sub: string;
  email: string;
  name?: string | null;
  picture?: string | null;
};

const USER_SELECT = { id: true, username: true, email: true, role: true, isActive: true } as const;

/** Turns an email's local part into a username that passes the sign-up rules. */
function usernameBase(email: string): string {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 18);
  return base.length >= 3 ? base : `rider_${base}`.slice(0, 18);
}

async function uniqueUsername(email: string): Promise<string> {
  const base = usernameBase(email);
  if (!(await prisma.user.findUnique({ where: { username: base }, select: { id: true } }))) return base;
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
    if (!(await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } }))) {
      return candidate;
    }
  }
  return `${base}_${Date.now().toString(36)}`;
}

/**
 * Finds the Rydo user behind a Google sign-in, linking by email or creating a
 * new account (profile left incomplete so onboarding still runs). Only call
 * with an identity whose email Google has verified.
 */
export async function findOrCreateGoogleUser(identity: GoogleIdentity) {
  const linked = await prisma.user.findFirst({
    where: { provider: "GOOGLE", providerAccountId: identity.sub },
    select: USER_SELECT,
  });
  if (linked) return linked;

  const byEmail = await prisma.user.findFirst({
    where: { email: { equals: identity.email, mode: "insensitive" } },
    select: { ...USER_SELECT, isVerified: true },
  });

  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        provider: "GOOGLE",
        providerAccountId: identity.sub,
        isVerified: true,
        // Someone could have signed up with this email and a password without
        // owning the inbox. If the email was never verified, drop that password
        // so it can't be used to get into the account the real owner now claims.
        ...(byEmail.isVerified ? {} : { passwordHash: null }),
      },
      select: USER_SELECT,
    });
  }

  const username = await uniqueUsername(identity.email);
  return prisma.user.create({
    data: {
      username,
      email: identity.email,
      provider: "GOOGLE",
      providerAccountId: identity.sub,
      isVerified: true,
      riderProfile: {
        create: { fullName: identity.name?.trim() || username, avatarUrl: identity.picture ?? null },
      },
    },
    select: USER_SELECT,
  });
}

export async function findGoogleUser(providerAccountId: string) {
  return prisma.user.findFirst({
    where: { provider: "GOOGLE", providerAccountId },
    select: USER_SELECT,
  });
}
