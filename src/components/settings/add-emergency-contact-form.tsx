"use client";

import { useActionState, useRef, useEffect } from "react";

import { addEmergencyContactAction } from "@/features/profile/server/actions";
import { initialFormState } from "@/features/profile/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddEmergencyContactForm({ atLimit }: { atLimit: boolean }) {
  const [state, formAction, isPending] = useActionState(addEmergencyContactAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  if (atLimit) {
    return (
      <p className="border-t border-white/8 pt-4 text-sm text-muted-foreground">
        You&apos;ve reached the limit of emergency contacts. Remove one to add another.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 border-t border-white/8 pt-4">
      <p className="text-sm font-medium">Add an emergency contact</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ec-name">Name</Label>
          <Input id="ec-name" name="name" placeholder="Jane Doe" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ec-phone">Phone</Label>
          <Input id="ec-phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="ec-relation">Relationship</Label>
          <Input id="ec-relation" name="relation" placeholder="Spouse, parent, friend..." />
        </div>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" variant="secondary" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Adding..." : "Add contact"}
      </Button>
    </form>
  );
}
