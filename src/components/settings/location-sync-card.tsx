"use client";

import { useState, useTransition } from "react";
import { LocateFixed, Loader2 } from "lucide-react";

import { updateLocationAction } from "@/features/profile/server/actions";
import { Button } from "@/components/ui/button";

type SyncStatus = "idle" | "locating" | "saved" | "denied" | "unsupported" | "error";

export function LocationSyncCard({ hasLocation }: { hasLocation: boolean }) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [isPending, startTransition] = useTransition();

  function handleSync() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        startTransition(async () => {
          const result = await updateLocationAction(latitude, longitude);
          setStatus(result.success ? "saved" : "error");
        });
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }

  const busy = status === "locating" || isPending;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">Location</p>
        <p className="text-xs text-muted-foreground">
          {status === "saved"
            ? "Location synced. Nearby riders will use this."
            : status === "denied"
              ? "Location access is blocked in your browser. Allow it in your browser/site settings, then sync again."
              : status === "unsupported"
                ? "Your browser doesn't support location access."
                : status === "error"
                  ? "Couldn't get your location. Try again."
                  : hasLocation
                    ? "Used to find riders and rides near you."
                    : "We don't have your location yet, so nearby riders won't show. Sync it below."}
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleSync} disabled={busy}>
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LocateFixed className="size-4" />
        )}
        {hasLocation ? "Re-sync" : "Sync location"}
      </Button>
    </div>
  );
}
