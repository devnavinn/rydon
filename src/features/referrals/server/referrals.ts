import "server-only";

import { randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { REFERRAL_BADGES } from "@/lib/badges";
import { createNotifications, type NotificationInput } from "@/features/notifications/server/mutations";
import {
  REFERRAL_ALPHABET,
  REFERRAL_CODE_LENGTH,
  REFERRAL_COOKIE,
  isReferralCode,
} from "@/features/referrals/constants";
import type { ReferralSummary } from "@/features/referrals/types";

function randomCode() {
  let code = "";
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) code += REFERRAL_ALPHABET[randomInt(REFERRAL_ALPHABET.length)];
  return code;
}

/** The rider's invite code, created on first use. */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (existing?.referralCode) return existing.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    let updated;
    try {
      // `referralCode: null` guards against a concurrent request having set one.
      updated = await prisma.user.updateMany({
        where: { id: userId, referralCode: null },
        data: { referralCode: code },
      });
    } catch (error) {
      // Unique collision with another rider's code — try a fresh one.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
    if (updated.count === 1) return code;

    const current = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
    if (current?.referralCode) return current.referralCode;
  }
  throw new Error("Couldn't generate a referral code");
}

export async function getReferralSummary(userId: string): Promise<ReferralSummary> {
  const [code, joinedCount, recent] = await Promise.all([
    getOrCreateReferralCode(userId),
    prisma.user.count({ where: { referredById: userId } }),
    prisma.user.findMany({
      where: { referredById: userId },
      select: { username: true, riderProfile: { select: { fullName: true } } },
      orderBy: { referredAt: "desc" },
      take: 5,
    }),
  ]);

  const next = REFERRAL_BADGES.find((badge) => badge.threshold > joinedCount) ?? null;

  return {
    code,
    joinedCount,
    nextBadge: next ? { label: next.label, threshold: next.threshold } : null,
    recent: recent.map((u) => ({ username: u.username, fullName: u.riderProfile?.fullName ?? u.username })),
  };
}

/**
 * Credits the rider whose invite brought `userId` in, using the referral
 * cookie set by /join/<code> or a `?ref=` link. Called once onboarding is
 * done, so a referral only counts for riders who actually set up a profile.
 */
export async function claimReferral(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const code = cookieStore.get(REFERRAL_COOKIE)?.value;
  if (!isReferralCode(code)) return;
  cookieStore.delete(REFERRAL_COOKIE);

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true, isActive: true },
  });
  if (!referrer?.isActive || referrer.id === userId) return;

  // Only the first claim sticks, even if onboarding is somehow submitted twice.
  const claimed = await prisma.user.updateMany({
    where: { id: userId, referredById: null },
    data: { referredById: referrer.id, referredAt: new Date() },
  });
  if (claimed.count === 0) return;

  await rewardReferrer(referrer.id, userId);
}

async function rewardReferrer(referrerId: string, newUserId: string) {
  const [joinedCount, profile, newUser] = await Promise.all([
    prisma.user.count({ where: { referredById: referrerId } }),
    prisma.riderProfile.findUnique({
      where: { userId: referrerId },
      select: { id: true, badgesEarned: { select: { code: true } } },
    }),
    prisma.user.findUnique({
      where: { id: newUserId },
      select: { username: true, riderProfile: { select: { fullName: true } } },
    }),
  ]);

  const name = newUser?.riderProfile?.fullName ?? newUser?.username ?? "A rider";
  const notifications: NotificationInput[] = [
    {
      userId: referrerId,
      type: "REFERRAL_JOINED",
      title: `${name} joined Rydo with your invite`,
      body: `That's ${joinedCount} ${joinedCount === 1 ? "rider" : "riders"} you've brought in. Invite them on a ride!`,
      data: { username: newUser?.username },
    },
  ];

  if (profile) {
    const earned = new Set(profile.badgesEarned.map((b) => b.code));
    const newBadges = REFERRAL_BADGES.filter((b) => b.threshold <= joinedCount && !earned.has(b.code));
    if (newBadges.length > 0) {
      await prisma.riderBadge.createMany({
        data: newBadges.map((b) => ({ riderProfileId: profile.id, code: b.code })),
        skipDuplicates: true,
      });
      for (const badge of newBadges) {
        notifications.push({
          userId: referrerId,
          type: "BADGE_EARNED",
          title: "New badge earned!",
          body: `You earned "${badge.label}" — ${badge.description}`,
          data: { badgeCode: badge.code },
        });
      }
    }
  }

  await createNotifications(notifications);
}
