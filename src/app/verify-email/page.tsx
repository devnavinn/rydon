import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { verifyEmailToken } from "@/features/auth/server/verification";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailToken(token)
    : { ok: false as const, reason: "Missing verification link." };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
      {result.ok ? (
        <CheckCircle2 className="size-10 text-primary" />
      ) : (
        <XCircle className="size-10 text-destructive" />
      )}
      <h1 className="font-heading text-2xl tracking-wide">
        {result.ok ? "Email verified" : "Verification failed"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {result.ok
          ? "Thanks — your email is confirmed."
          : result.reason}
      </p>
      <Link href="/dashboard" className="text-sm text-primary underline underline-offset-2">
        Go to dashboard
      </Link>
    </div>
  );
}

export function generateMetadata() {
  return { title: "Verify email — Rydo" };
}
