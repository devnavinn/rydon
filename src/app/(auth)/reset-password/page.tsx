import Link from "next/link";

import { checkPasswordResetToken } from "@/features/auth/server/password-reset";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const check = token
    ? await checkPasswordResetToken(token)
    : { ok: false as const, reason: "Missing reset link." };

  return (
    <Card className="border-white/10 shadow-2xl shadow-black/40">
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-wide">Set a new password</CardTitle>
        <CardDescription>
          {check.ok ? "Choose a new password for your account." : "This link can't be used."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {check.ok && token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm text-destructive">{check.ok ? null : check.reason}</p>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-foreground underline"
            >
              Request a new link
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function generateMetadata() {
  return { title: "Reset password — Rydo" };
}
