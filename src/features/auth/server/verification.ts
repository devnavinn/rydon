import "server-only";

import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { env } from "@/lib/env";
import { getAppUrl } from "@/lib/app-url";

const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

export async function sendVerificationEmail(userId: string, email: string, username: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS);

  // Only one live token per user — requesting a new one invalidates the last.
  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId } }),
    prisma.emailVerificationToken.create({ data: { userId, token, expiresAt } }),
  ]);

  const verifyUrl = `${await getAppUrl()}/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Verify your email for Rydo",
    html: `
      <p>Hey ${username},</p>
      <p>Welcome to Rydo — confirm this is really your email address:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours. If you didn't create a Rydo account, you can ignore this email.</p>
    `,
  });

  // The Resend SDK reports API-level failures (e.g. unverified sender domain)
  // via this field rather than throwing, so callers relying on try/catch
  // would otherwise see a false success.
  if (error) throw new Error(error.message);
}

export type VerifyResult = { ok: true } | { ok: false; reason: string };

export async function verifyEmailToken(token: string): Promise<VerifyResult> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  });

  if (!record) return { ok: false, reason: "This verification link is invalid." };
  if (record.expiresAt < new Date()) {
    return { ok: false, reason: "This verification link has expired — request a new one." };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true };
}
