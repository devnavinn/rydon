"use client";

import { useActionState } from "react";
import type { ClubJoinPolicy } from "@prisma/client";

import { CLUB_JOIN_POLICIES } from "@/lib/enums";
import { JOIN_POLICY_LABELS } from "@/features/clubs/constants";
import type { ActionState } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ClubForm({
  action,
  club,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  club?: { name: string; description: string | null; city: string | null; joinPolicy: ClubJoinPolicy };
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="club-name">Club name</Label>
        <Input id="club-name" name="name" defaultValue={club?.name} placeholder="Bangalore Bullet Riders" required minLength={3} maxLength={60} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="club-city">Home city</Label>
        <Input id="club-city" name="city" defaultValue={club?.city ?? ""} placeholder="Bengaluru" maxLength={80} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="club-description">About the club</Label>
        <Textarea
          id="club-description"
          name="description"
          defaultValue={club?.description ?? ""}
          placeholder="Who you are, how often you ride, what bikes, what the vibe is."
          maxLength={1000}
          rows={4}
        />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">Who can join</legend>
        {CLUB_JOIN_POLICIES.map((policy) => (
          <label key={policy} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="joinPolicy"
              value={policy}
              defaultChecked={(club?.joinPolicy ?? "APPROVAL") === policy}
              className="accent-primary"
            />
            {JOIN_POLICY_LABELS[policy]}
          </label>
        ))}
        <p className="text-xs text-muted-foreground">Anyone with your invite link can always join, whichever you pick.</p>
      </fieldset>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto sm:self-start">
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
