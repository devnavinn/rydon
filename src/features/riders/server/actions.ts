"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next";
import { claimReferral } from "@/features/referrals/server/referrals";
import { onboardingSchema } from "@/features/riders/validators";
import type { ActionState } from "@/features/auth/server/actions";

export async function completeOnboardingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const parsed = onboardingSchema.safeParse({
    fullName: formData.get("fullName"),
    city: formData.get("city"),
    ridingStyle: formData.get("ridingStyle") || undefined,
    preferredRadiusKm: formData.get("preferredRadiusKm") || undefined,
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
    bikeBrand: formData.get("bikeBrand"),
    bikeModel: formData.get("bikeModel"),
    bikeYear: formData.get("bikeYear") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  await prisma.$transaction([
    prisma.riderProfile.update({
      where: { userId: user.id },
      data: {
        fullName: data.fullName,
        city: data.city || null,
        ridingStyle: data.ridingStyle,
        preferredRadiusKm: data.preferredRadiusKm,
        latitude: data.latitude,
        longitude: data.longitude,
        profileCompleted: true,
      },
    }),
    prisma.bike.create({
      data: {
        userId: user.id,
        brand: data.bikeBrand,
        model: data.bikeModel,
        year: data.bikeYear,
        isPrimary: true,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    }),
  ]);

  try {
    await claimReferral(user.id);
  } catch (error) {
    // A referral hiccup must never block a rider from getting in.
    console.error("claimReferral failed", error);
  }

  redirect(safeNextPath(formData.get("next")) ?? "/dashboard");
}
