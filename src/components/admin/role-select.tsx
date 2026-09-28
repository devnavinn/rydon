"use client";

import { useActionState } from "react";
import type { UserRole } from "@prisma/client";

import { setUserRoleAction } from "@/features/admin/server/actions";
import { USER_ROLES } from "@/lib/enums";
import { Button } from "@/components/ui/button";

export function RoleSelect({ userId, role }: { userId: string; role: UserRole }) {
  const [state, formAction, isPending] = useActionState(setUserRoleAction.bind(null, userId), { error: null });

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1.5">
        <select
          name="role"
          defaultValue={role}
          aria-label="Role"
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="ghost" disabled={isPending}>
          {isPending ? "Saving…" : "Set"}
        </Button>
      </div>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
