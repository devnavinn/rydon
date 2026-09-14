import "server-only";

import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { env } from "@/lib/env";
import { getAppUrl } from "@/lib/app-url";
import { hashPassword } from "@/lib/password";

const TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export async function sendPasswordResetEmail(userId: string, email: string, username: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS);

  // Only one live token per user — requesting a new one invalidates the last.
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({ data: { userId, token, expiresAt } }),
  ]);

  const resetUrl = `${await getAppUrl()}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Reset your Rydo password",
    html: `
      <p>Hey ${username},</p>
      <p>Someone asked to reset the password on this account. If that was you:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email — your password won't change.</p>
    `,
  });

  // The Resend SDK reports API-level failures (e.g. unverified sender domain)
  // via this field rather than throwing, so callers relying on try/catch
  // would otherwise see a false success.
  if (error) throw new Error(error.message);
}

export type ResetTokenCheck = { ok: true } | { ok: false; reason: string };

export async function checkPasswordResetToken(token: string): Promise<ResetTokenCheck> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { expiresAt: true },
  });

  if (!record) return { ok: false, reason: "This reset link is invalid." };
  if (record.expiresAt < new Date()) {
    return { ok: false, reason: "This reset link has expired — request a new one." };
  }

  return { ok: true };
}

export type ResetPasswordResult = { ok: true } | { ok: false; reason: string };

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<ResetPasswordResult> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  });

  if (!record) return { ok: false, reason: "This reset link is invalid." };
  if (record.expiresAt < new Date()) {
    return { ok: false, reason: "This reset link has expired — request a new one." };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true };
}
