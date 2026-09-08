"use client";

import { useActionState, useRef, useEffect } from "react";

import { addBikeAction } from "@/features/profile/server/actions";
import { initialFormState } from "@/features/profile/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddBikeForm() {
  const [state, formAction, isPending] = useActionState(addBikeAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 border-t border-white/8 pt-4">
      <p className="text-sm font-medium">Add a bike</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" placeholder="Royal Enfield" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" placeholder="Himalayan" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="variant">Variant</Label>
          <Input id="variant" name="variant" placeholder="450" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" min={1950} max={2100} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" placeholder="Granite Black" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="engineCc">Engine (cc)</Label>
          <Input id="engineCc" name="engineCc" type="number" min={0} max={10000} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="registrationNo">Registration number</Label>
          <Input id="registrationNo" name="registrationNo" placeholder="KA 01 AB 1234" />
        </div>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" variant="secondary" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Adding..." : "Add bike"}
      </Button>
    </form>
  );
}
