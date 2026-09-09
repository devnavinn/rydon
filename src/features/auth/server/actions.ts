"use server";

import { AuthError } from "next-auth";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/auth";
import { getCurrentUser } from "@/lib/auth";
import { signInSchema, signUpSchema } from "@/features/auth/validators";
import { sendVerificationEmail } from "@/features/auth/server/verification";

export type ActionState = { error: string | null };

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { id: true },
  });
  if (existing) {
    return { error: "That username or email is already taken" };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      riderProfile: { create: { fullName: username } },
    },
    select: { id: true },
  });

  try {
    await sendVerificationEmail(user.id, email, username);
  } catch {
    // Don't block account creation on a flaky email provider — the nudge
    // banner's "resend" button covers this case.
  }

  try {
    await signIn("credentials", { identifier: username, password, redirectTo: "/onboarding" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed — try signing in." };
    }
    throw error;
  }

  return { error: null };
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Incorrect username/email or password" };
    }
    throw error;
  }

  return { error: null };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}

export type ResendVerificationState = { error: string | null; sent: boolean };

export async function resendVerificationEmailAction(
  _prev: ResendVerificationState
): Promise<ResendVerificationState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in", sent: false };
  if (user.isVerified) return { error: null, sent: false };
  if (!user.email) return { error: "Your account has no email on file", sent: false };

  try {
    await sendVerificationEmail(user.id, user.email, user.username);
  } catch {
    return { error: "Couldn't send the email right now — try again in a bit.", sent: false };
  }

  return { error: null, sent: true };
}
