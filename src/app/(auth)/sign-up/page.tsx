import type { Metadata } from "next";
import { googleAuthEnabled } from "@/lib/env";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export const metadata: Metadata = {
  title: { absolute: "Join Rydo — Find riders and group rides near you" },
  description: "Create your free rider account — find riders nearby and join group rides.",
  alternates: { canonical: "/sign-up" },
  robots: { index: true, follow: true },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : "";

  return (
    <SignUpForm
      nextPath={nextPath}
      google={googleAuthEnabled ? <GoogleSignInButton next={nextPath} /> : null}
    />
  );
}
