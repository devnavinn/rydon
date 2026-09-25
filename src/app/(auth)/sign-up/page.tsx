import { googleAuthEnabled } from "@/lib/env";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

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
