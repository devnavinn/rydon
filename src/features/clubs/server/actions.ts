"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ClubRole } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth";
import { clubPath } from "@/features/clubs/constants";
import { clubSchema } from "@/features/clubs/validators";
import {
  ClubError,
  approveMember,
  createClub,
  deleteClub,
  joinClub,
  leaveClub,
  regenerateInviteCode,
  removeMember,
  setMemberRole,
  updateClub,
} from "@/features/clubs/server/mutations";
import type { ActionState } from "@/features/auth/server/actions";

const ok: ActionState = { error: null };

/** Runs a club mutation, turning expected ClubErrors into form errors. */
async function run(fn: (userId: string) => Promise<unknown>): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  try {
    await fn(user.id);
  } catch (error) {
    if (error instanceof ClubError) return { error: error.message };
    throw error;
  }
  revalidatePath("/clubs", "layout");
  return ok;
}

function parseClubForm(formData: FormData) {
  return clubSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    city: formData.get("city") || undefined,
    joinPolicy: formData.get("joinPolicy"),
  });
}

export async function createClubAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const parsed = parseClubForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const club = await createClub(user.id, parsed.data);
  redirect(clubPath(club.slug));
}

export async function updateClubAction(clubId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseClubForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  let slug = "";
  const result = await run(async (userId) => {
    slug = (await updateClub(clubId, userId, parsed.data)).slug;
  });
  if (result.error) return result;
  redirect(clubPath(slug));
}

export async function deleteClubAction(clubId: string): Promise<ActionState> {
  const result = await run((userId) => deleteClub(clubId, userId));
  if (result.error) return result;
  redirect("/clubs");
}

export async function joinClubAction(clubId: string, inviteCode: string | null): Promise<ActionState> {
  return run((userId) => joinClub(clubId, userId, inviteCode));
}

export async function leaveClubAction(clubId: string): Promise<ActionState> {
  return run((userId) => leaveClub(clubId, userId));
}

export async function regenerateInviteAction(clubId: string): Promise<ActionState> {
  return run((userId) => regenerateInviteCode(clubId, userId));
}

export async function approveMemberAction(clubId: string, targetId: string): Promise<ActionState> {
  return run((userId) => approveMember(clubId, userId, targetId));
}

export async function removeMemberAction(clubId: string, targetId: string): Promise<ActionState> {
  return run((userId) => removeMember(clubId, userId, targetId));
}

export async function setMemberRoleAction(clubId: string, targetId: string, role: ClubRole): Promise<ActionState> {
  if (!["OWNER", "ADMIN", "MEMBER"].includes(role)) return { error: "Invalid role" };
  return run((userId) => setMemberRole(clubId, userId, targetId, role));
}
