"use client";

import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDiscoveryStore } from "@/store/discovery-store";

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

export function RadiusFilter() {
  const { radiusKm, style, setRadiusKm, setStyle } = useDiscoveryStore();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <span className="shrink-0 text-sm font-medium text-muted-foreground">
          Radius: {radiusKm} km
        </span>
        <Slider
          value={[radiusKm]}
          onValueChange={([value]) => setRadiusKm(value)}
          min={1}
          max={200}
          step={1}
          className="max-w-xs"
        />
      </div>
      <Select
        value={style}
        onValueChange={(value) => setStyle(value as typeof style)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Any style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Any style</SelectItem>
          {RIDE_STYLES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
