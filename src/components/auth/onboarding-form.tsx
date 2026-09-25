"use client";

import { useActionState } from "react";

import { completeOnboardingAction } from "@/features/riders/server/actions";
import type { ActionState } from "@/features/auth/server/actions";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RIDE_STYLES = [
  "CITY",
  "BREAKFAST",
  "HIGHWAY",
  "WEEKEND",
  "OFFROAD",
  "TOURING",
  "CHARITY",
  "NIGHT",
] as const;

const initialState: ActionState = { error: null };

export function OnboardingForm({ nextPath, defaultFullName }: { nextPath: string; defaultFullName: string }) {
  const [state, formAction, isPending] = useActionState(
    completeOnboardingAction,
    initialState
  );
  const { position, status } = useGeolocation();

  return (
    <Card className="max-w-md border-white/10 shadow-2xl shadow-black/40">
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-wide">Set up your rider profile</CardTitle>
        <CardDescription>
          Tell the brotherhood who you are and what you ride.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={nextPath} />
          <input type="hidden" name="latitude" value={position?.lat ?? ""} />
          <input type="hidden" name="longitude" value={position?.lng ?? ""} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" defaultValue={defaultFullName} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" placeholder="Bengaluru" />
            <p className="text-xs text-muted-foreground">
              {status === "success"
                ? "Location detected — we'll use it to find riders near you."
                : "Allow location access, or we'll use your city to estimate distances."}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ridingStyle">Favorite riding style</Label>
            <Select name="ridingStyle">
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
            <Label htmlFor="preferredRadiusKm">Riding radius (km)</Label>
            <Input
              id="preferredRadiusKm"
              name="preferredRadiusKm"
              type="number"
              min={1}
              max={200}
              defaultValue={25}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bikeBrand">Bike brand</Label>
              <Input id="bikeBrand" name="bikeBrand" placeholder="Royal Enfield" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bikeModel">Model</Label>
              <Input id="bikeModel" name="bikeModel" placeholder="Himalayan" required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bikeYear">Year</Label>
            <Input id="bikeYear" name="bikeYear" type="number" min={1950} max={2100} />
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? "Saving..." : "Enter Rydo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
