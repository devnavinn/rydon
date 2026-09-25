import { googleAuthEnabled } from "@/lib/env";
import { SignInForm } from "@/components/auth/sign-in-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

// Auth.js redirects failed OAuth sign-ins back here with `?error=<code>`.
const OAUTH_ERRORS: Record<string, string> = {
  AccessDenied: "That Google account can't sign in to Rydo. It may be unverified or deactivated.",
  OAuthAccountNotLinked: "That email is already linked to another sign-in method.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
}) {
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" ? next : "";
  const oauthError =
    typeof error === "string" ? (OAUTH_ERRORS[error] ?? "Sign-in failed. Please try again.") : null;

  return (
    <SignInForm
      nextPath={nextPath}
      oauthError={oauthError}
      google={googleAuthEnabled ? <GoogleSignInButton next={nextPath} /> : null}
    />
  );
}
