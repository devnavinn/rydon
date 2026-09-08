"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/features/profile/server/actions";
import { initialFormState } from "@/features/profile/types";
import { RIDE_STYLES } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Profile = {
  fullName: string;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  ridingStyle: string | null;
  preferredRadiusKm: number | null;
  yearsRiding: number | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialFormState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={profile.fullName} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          placeholder="Tell the brotherhood a bit about yourself"
          maxLength={280}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={profile.city ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" defaultValue={profile.state ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={profile.country ?? "India"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ridingStyle">Favorite riding style</Label>
          <Select name="ridingStyle" defaultValue={profile.ridingStyle ?? undefined}>
            <SelectTrigger id="ridingStyle" className="w-full">
              <SelectValue placeholder="Pick a style" />
            </SelectTrigger>
            <SelectContent>
              {RIDE_STYLES.map((style) => (
                <SelectItem key={style} value={style}>
                  {style.charAt(0) + style.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="yearsRiding">Years riding</Label>
          <Input
            id="yearsRiding"
            name="yearsRiding"
            type="number"
            min={0}
            max={80}
            defaultValue={profile.yearsRiding ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="preferredRadiusKm">Riding radius (km)</Label>
        <Input
          id="preferredRadiusKm"
          name="preferredRadiusKm"
          type="number"
          min={1}
          max={200}
          defaultValue={profile.preferredRadiusKm ?? 25}
        />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary">Profile updated.</p> : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
