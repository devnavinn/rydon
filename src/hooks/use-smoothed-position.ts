"use client";

import { useEffect, useRef, useState } from "react";

import { haversineDistanceKm } from "@/lib/geo";

const ANIMATION_MS = 700;
/** Jumps bigger than this are a new/teleported position, not live movement — snap instead of gliding across the map. */
const MAX_ANIMATED_JUMP_KM = 5;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Animates a lat/lng towards its latest value instead of snapping, so a live
 * GPS-driven marker glides between updates rather than jumping. */
export function useSmoothedPosition(lat: number, lng: number) {
  const [display, setDisplay] = useState({ lat, lng });
  const currentRef = useRef({ lat, lng });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = currentRef.current;
    if (from.lat === lat && from.lng === lng) return;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    if (haversineDistanceKm(from, { lat, lng }) > MAX_ANIMATED_JUMP_KM) {
      currentRef.current = { lat, lng };
      setDisplay({ lat, lng });
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ANIMATION_MS);
      const eased = easeOutCubic(t);
      const next = { lat: from.lat + (lat - from.lat) * eased, lng: from.lng + (lng - from.lng) * eased };
      currentRef.current = next;
      setDisplay(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [lat, lng]);

  return display;
}
