"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  bikeSchema,
  emergencyContactSchema,
  profileUpdateSchema,
  MAX_EMERGENCY_CONTACTS,
} from "@/features/profile/validators";
import type { FormState } from "@/features/profile/types";

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    bio: formData.get("bio"),
    city: formData.get("city"),
    state: formData.get("state"),
    country: formData.get("country"),
    ridingStyle: formData.get("ridingStyle") || undefined,
    preferredRadiusKm: formData.get("preferredRadiusKm") || undefined,
    yearsRiding: formData.get("yearsRiding") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", success: false };
  }

  const data = parsed.data;

  await prisma.riderProfile.update({
    where: { userId: user.id },
    data: {
      fullName: data.fullName,
      bio: data.bio || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      ridingStyle: data.ridingStyle ?? null,
      preferredRadiusKm: data.preferredRadiusKm,
      yearsRiding: data.yearsRiding ?? null,
    },
  });

  revalidatePath("/settings");
  revalidatePath(`/riders/${user.username}`);
  return { error: null, success: true };
}

export async function toggleEmergencySharingAction(): Promise<void> {
  const user = await requireUser();
  const profile = await prisma.riderProfile.findUniqueOrThrow({
    where: { userId: user.id },
    select: { emergencySharingOn: true },
  });

  await prisma.riderProfile.update({
    where: { userId: user.id },
    data: { emergencySharingOn: !profile.emergencySharingOn },
  });

  revalidatePath("/settings");
}

export async function addBikeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const parsed = bikeSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    variant: formData.get("variant"),
    year: formData.get("year") || undefined,
    registrationNo: formData.get("registrationNo"),
    engineCc: formData.get("engineCc") || undefined,
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", success: false };
  }

  const data = parsed.data;
  const existingCount = await prisma.bike.count({ where: { userId: user.id } });

  await prisma.bike.create({
    data: {
      userId: user.id,
      brand: data.brand,
      model: data.model,
      variant: data.variant || null,
      year: data.year,
      registrationNo: data.registrationNo || null,
      engineCc: data.engineCc,
      color: data.color || null,
      isPrimary: existingCount === 0,
    },
  });

  revalidatePath("/settings");
  return { error: null, success: true };
}

export async function deleteBikeAction(bikeId: string): Promise<void> {
  const user = await requireUser();
  await prisma.bike.deleteMany({ where: { id: bikeId, userId: user.id } });
  revalidatePath("/settings");
}

export async function setPrimaryBikeAction(bikeId: string): Promise<void> {
  const user = await requireUser();
  await prisma.$transaction([
    prisma.bike.updateMany({ where: { userId: user.id }, data: { isPrimary: false } }),
    prisma.bike.updateMany({ where: { id: bikeId, userId: user.id }, data: { isPrimary: true } }),
  ]);
  revalidatePath("/settings");
}

export async function addEmergencyContactAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const parsed = emergencyContactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    relation: formData.get("relation"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", success: false };
  }

  const data = parsed.data;
  const existingCount = await prisma.emergencyContact.count({ where: { userId: user.id } });

  if (existingCount >= MAX_EMERGENCY_CONTACTS) {
    return {
      error: `You can add up to ${MAX_EMERGENCY_CONTACTS} emergency contacts`,
      success: false,
    };
  }

  await prisma.emergencyContact.create({
    data: {
      userId: user.id,
      name: data.name,
      phone: data.phone,
      relation: data.relation || null,
      isPrimary: existingCount === 0,
    },
  });

  revalidatePath("/settings");
  return { error: null, success: true };
}

export async function deleteEmergencyContactAction(contactId: string): Promise<void> {
  const user = await requireUser();
  await prisma.emergencyContact.deleteMany({ where: { id: contactId, userId: user.id } });
  revalidatePath("/settings");
}

export async function setPrimaryEmergencyContactAction(contactId: string): Promise<void> {
  const user = await requireUser();
  await prisma.$transaction([
    prisma.emergencyContact.updateMany({ where: { userId: user.id }, data: { isPrimary: false } }),
    prisma.emergencyContact.updateMany({
      where: { id: contactId, userId: user.id },
      data: { isPrimary: true },
    }),
  ]);
  revalidatePath("/settings");
}
