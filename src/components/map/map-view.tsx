"use client";

import dynamic from "next/dynamic";

export const MapView = dynamic(
  () => import("@/components/map/rider-map").then((mod) => mod.RiderMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  }
);
