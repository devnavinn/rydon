import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const [{ next }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const nextPath = safeNextPath(next) ?? "";

  if (!user) redirect("/sign-in");
  // Google sign-in always routes through here; returning riders skip ahead.
  if (user.riderProfile?.profileCompleted) redirect(nextPath || "/dashboard");

  // Google sign-ups already have a name — prefill it (username is the fallback).
  const fullName = user.riderProfile?.fullName;
  const defaultFullName = fullName && fullName !== user.username ? fullName : "";

  return <OnboardingForm nextPath={nextPath} defaultFullName={defaultFullName} />;
}
