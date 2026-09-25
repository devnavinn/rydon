"use server";

import { AuthError } from "next-auth";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/auth";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next";
import {
  signInSchema,
  signUpSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/features/auth/validators";
import { sendVerificationEmail } from "@/features/auth/server/verification";
import {
  sendPasswordResetEmail,
  resetPasswordWithToken,
} from "@/features/auth/server/password-reset";

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
    const next = safeNextPath(formData.get("next"));
    const redirectTo = next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding";
    await signIn("credentials", { identifier: username, password, redirectTo });
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
    const redirectTo = safeNextPath(formData.get("next")) ?? "/dashboard";
    await signIn("credentials", { ...parsed.data, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Incorrect username/email or password" };
    }
    throw error;
  }

  return { error: null };
}

/** Always lands on onboarding — it forwards riders who've finished it on to `next`. */
export async function signInWithGoogleAction(formData: FormData) {
  const next = safeNextPath(formData.get("next"));
  const redirectTo = next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding";
  await signIn("google", { redirectTo });
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

export type RequestPasswordResetState = { error: string | null; submitted: boolean };

export async function requestPasswordResetAction(
  _prev: RequestPasswordResetState,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", submitted: false };
  }

  const user = await prisma.user.findFirst({
    where: { email: parsed.data.email, passwordHash: { not: null } },
    select: { id: true, username: true, email: true },
  });

  // Deliberately vague — always report success so we don't reveal whether
  // an email is registered (or whether it's a password-based account).
  if (user?.email) {
    try {
      await sendPasswordResetEmail(user.id, user.email, user.username);
    } catch {
      // Don't block the generic response on a flaky email provider.
    }
  }

  return { error: null, submitted: true };
}

export type ResetPasswordState = { error: string | null; success: boolean };

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", success: false };
  }

  const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!result.ok) return { error: result.reason, success: false };

  return { error: null, success: true };
}
