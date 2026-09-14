"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Flag } from "lucide-react";

import {
  createRideSchema,
  type CreateRideInput,
  type CreateRideFormInput,
} from "@/features/rides/validators";
import { useCreateRide, useUpdateRide } from "@/features/rides/mutations";
import type { RideDetail } from "@/features/rides/types";
import { MapView } from "@/components/map/map-view";
import type { MapMarker } from "@/components/map/rider-map";
import { LocationSearchInput } from "@/components/shared/location-search-input";
import type { PlaceSuggestion } from "@/features/geo/photon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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

type PickTarget = "start" | "destination";

function toTimeInputValue(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function RideForm({ center, ride }: { center: [number, number]; ride?: RideDetail }) {
  const [pickTarget, setPickTarget] = useState<PickTarget>("start");
  const createRide = useCreateRide();
  const updateRide = useUpdateRide(ride?.id ?? "");
  const activeMutation = ride ? updateRide : createRide;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRideFormInput, unknown, CreateRideInput>({
    resolver: zodResolver(createRideSchema),
    defaultValues: ride
      ? {
          title: ride.title,
          description: ride.description ?? "",
          notes: ride.notes ?? "",
          startLocationName: ride.startLocationName,
          startLatitude: ride.startLatitude,
          startLongitude: ride.startLongitude,
          destinationName: ride.destinationName,
          destinationLatitude: ride.destinationLatitude,
          destinationLongitude: ride.destinationLongitude,
          rideDate: ride.rideDate.slice(0, 10),
          meetupTime: toTimeInputValue(ride.meetupTime),
          style: ride.style,
          visibility: ride.visibility,
          maxRiders: ride.maxRiders,
          minRiders: ride.minRiders,
          requiresApproval: ride.requiresApproval,
          allowPillion: ride.allowPillion,
          helmetRequired: ride.helmetRequired,
        }
      : {
          style: "WEEKEND",
          visibility: "PUBLIC",
          maxRiders: 10,
          minRiders: 2,
          requiresApproval: true,
          allowPillion: false,
          helmetRequired: true,
          startLatitude: center[0],
          startLongitude: center[1],
          destinationLatitude: center[0],
          destinationLongitude: center[1],
        },
  });

  const startLat = watch("startLatitude");
  const startLng = watch("startLongitude");
  const destLat = watch("destinationLatitude");
  const destLng = watch("destinationLongitude");

  const markers: MapMarker[] = [
    { id: "start", lat: startLat, lng: startLng, kind: "start", label: "Start" },
    { id: "destination", lat: destLat, lng: destLng, kind: "destination", label: "Destination" },
  ];

  function handleMapClick(lat: number, lng: number) {
    if (pickTarget === "start") {
      setValue("startLatitude", lat, { shouldValidate: true });
      setValue("startLongitude", lng, { shouldValidate: true });
    } else {
      setValue("destinationLatitude", lat, { shouldValidate: true });
      setValue("destinationLongitude", lng, { shouldValidate: true });
    }
  }

  function handleStartSelect(place: PlaceSuggestion) {
    setValue("startLocationName", place.label, { shouldValidate: true });
    setValue("startLatitude", place.lat, { shouldValidate: true });
    setValue("startLongitude", place.lng, { shouldValidate: true });
    setPickTarget("start");
  }

  function handleDestinationSelect(place: PlaceSuggestion) {
    setValue("destinationName", place.label, { shouldValidate: true });
    setValue("destinationLatitude", place.lat, { shouldValidate: true });
    setValue("destinationLongitude", place.lng, { shouldValidate: true });
    setPickTarget("destination");
  }

  return (
    <form
      onSubmit={handleSubmit((data) => activeMutation.mutate(data))}
      className="flex flex-col gap-4"
    >
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Ride title</Label>
            <Input id="title" placeholder="Sunday Ghat Run" {...register("title")} />
            {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rideDate">Date</Label>
              <Input id="rideDate" type="date" {...register("rideDate")} />
              {errors.rideDate ? (
                <p className="text-sm text-destructive">{errors.rideDate.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meetupTime">Meetup time</Label>
              <Input id="meetupTime" type="time" {...register("meetupTime")} />
              {errors.meetupTime ? (
                <p className="text-sm text-destructive">{errors.meetupTime.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="style">Ride style</Label>
              <Select
                defaultValue={ride?.style ?? "WEEKEND"}
                onValueChange={(value) => setValue("style", value as CreateRideFormInput["style"])}
              >
                <SelectTrigger id="style" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RIDE_STYLES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="minRiders">Min riders</Label>
                <Input
                  id="minRiders"
                  type="number"
                  min={1}
                  {...register("minRiders", { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maxRiders">Max riders</Label>
                <Input
                  id="maxRiders"
                  type="number"
                  min={2}
                  {...register("maxRiders", { valueAsNumber: true })}
                />
                {errors.maxRiders ? (
                  <p className="text-sm text-destructive">{errors.maxRiders.message}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes for riders</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Fuel up before the meetup, helmets mandatory..."
              {...register("notes")}
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={ride?.requiresApproval ?? true} {...register("requiresApproval")} />
              Require host approval to join
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={ride?.allowPillion ?? false} {...register("allowPillion")} />
              Allow pillion riders
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={ride?.helmetRequired ?? true} {...register("helmetRequired")} />
              Helmet required
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm font-medium">Route</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startLocationName">Meetup point</Label>
              <LocationSearchInput
                id="startLocationName"
                placeholder="Search for the meetup point..."
                near={{ lat: center[0], lng: center[1] }}
                defaultValue={ride?.startLocationName}
                onSelect={handleStartSelect}
              />
              {errors.startLocationName ? (
                <p className="text-sm text-destructive">{errors.startLocationName.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="destinationName">Destination</Label>
              <LocationSearchInput
                id="destinationName"
                placeholder="Search for the destination..."
                near={{ lat: startLat ?? center[0], lng: startLng ?? center[1] }}
                defaultValue={ride?.destinationName}
                onSelect={handleDestinationSelect}
              />
              {errors.destinationName ? (
                <p className="text-sm text-destructive">{errors.destinationName.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              Not quite right? Click the map to fine-tune the {pickTarget === "start" ? "meetup point" : "destination"}.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={pickTarget === "start" ? "default" : "outline"}
                onClick={() => setPickTarget("start")}
              >
                <MapPin className="size-3.5" /> Start
              </Button>
              <Button
                type="button"
                size="sm"
                variant={pickTarget === "destination" ? "default" : "outline"}
                onClick={() => setPickTarget("destination")}
              >
                <Flag className="size-3.5" /> Destination
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border" style={{ height: 320 }}>
            <MapView center={center} zoom={11} markers={markers} onMapClick={handleMapClick} />
          </div>
        </CardContent>
      </Card>

      {activeMutation.isError ? (
        <p className="text-sm text-destructive">{activeMutation.error.message}</p>
      ) : null}

      <Button type="submit" disabled={activeMutation.isPending} className="self-start">
        {ride
          ? activeMutation.isPending
            ? "Saving changes..."
            : "Save changes"
          : activeMutation.isPending
            ? "Creating ride..."
            : "Create ride"}
      </Button>
    </form>
  );
}
