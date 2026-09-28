"use client";

import { useActionState } from "react";

import type { ActionState } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";

/** One-click moderation action (suspend, remove, cancel…) with an optional confirm step. */
export function AdminActionButton({
  action,
  label,
  pendingLabel,
  confirmMessage,
  variant = "outline",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  pendingLabel: string;
  confirmMessage?: string;
  variant?: "outline" | "destructive" | "secondary";
}) {
  const [state, formAction, isPending] = useActionState(action, { error: null });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="flex flex-col items-start gap-1"
    >
      <Button type="submit" size="sm" variant={variant} disabled={isPending}>
        {isPending ? pendingLabel : label}
      </Button>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
