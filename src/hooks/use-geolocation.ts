"use client";

import { useEffect, useRef, useState } from "react";

import { haversineDistanceKm } from "@/lib/geo";

export type GeoPosition = { lat: number; lng: number };

export type GeolocationState = {
  position: GeoPosition | null;
  status: "idle" | "loading" | "success" | "denied" | "unsupported";
};

// GPS readings jitter by a few meters even standing still. Anything under
// this is noise, not movement — committing it would change `position`'s
// value, which changes query keys (e.g. useNearbyRiders) and makes pages
// that key data off it look like they keep reloading.
const MIN_MOVEMENT_KM = 0.03;

/**
 * Wraps the browser Geolocation API. Callers should pass a `fallback`
 * (e.g. the signed-in rider's saved profile coordinates) to use while
 * permission is pending or if the browser denies/lacks geolocation.
 */
export function useGeolocation(fallback?: GeoPosition | null) {
  const [state, setState] = useState<GeolocationState>({
    position: fallback ?? null,
    status: "idle",
  });
  const lastCommittedRef = useRef<GeoPosition | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // Availability can only be known client-side; setting it here (rather
      // than during render) avoids a server/client hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((s) => ({ ...s, status: "unsupported" }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const last = lastCommittedRef.current;
        if (last && haversineDistanceKm(last, next) < MIN_MOVEMENT_KM) return;

        lastCommittedRef.current = next;
        setState({ position: next, status: "success" });
      },
      () => {
        setState((s) => ({ ...s, status: "denied" }));
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 10_000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const position = state.position ?? fallback ?? null;

  return { ...state, position };
}
