"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";

import {
  resendVerificationEmailAction,
  type ResendVerificationState,
} from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";

const initialState: ResendVerificationState = { error: null, sent: false };

export function VerifyEmailBanner() {
  const [state, formAction, isPending] = useActionState(
    resendVerificationEmailAction,
    initialState
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm">
      <span className="flex items-center gap-1.5 text-amber-200">
        <Mail className="size-3.5" />
        {state.sent ? "Verification email sent — check your inbox." : "Verify your email to secure your account."}
      </span>
      <div className="flex items-center gap-2">
        {state.error ? <span className="text-xs text-destructive">{state.error}</span> : null}
        <form action={formAction}>
          <Button type="submit" variant="outline" size="sm" disabled={isPending}>
            {isPending ? "Sending..." : "Resend email"}
          </Button>
        </form>
      </div>
    </div>
  );
}
