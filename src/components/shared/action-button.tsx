"use client";

import { useActionState } from "react";

import type { ActionState } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";

/** One-click server action (suspend, remove, approve…) with an optional confirm step. */
export function ActionButton({
  action,
  label,
  pendingLabel,
  confirmMessage,
  variant = "outline",
  size = "sm",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  pendingLabel: string;
  confirmMessage?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
  size?: "xs" | "sm" | "default";
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
      <Button type="submit" size={size} variant={variant} disabled={isPending}>
        {isPending ? pendingLabel : label}
      </Button>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
