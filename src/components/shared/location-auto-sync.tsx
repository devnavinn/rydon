"use client";

import { useEffect, useRef } from "react";

import { updateLocationAction } from "@/features/profile/server/actions";

/**
 * Silently keeps the signed-in rider's saved location fresh: if the browser
 * already has geolocation permission granted (from onboarding or the
 * Settings "Sync location" action), pull a current fix and persist it on
 * every app open — riders move around, so a location saved once at signup
 * would otherwise go stale. Never prompts for permission itself; that ask
 * only happens via onboarding or the explicit Settings control.
 */
export function LocationAutoSync() {
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (hasSyncedRef.current) return;
    if (typeof navigator === "undefined" || !navigator.geolocation || !navigator.permissions) return;

    let cancelled = false;

    function syncIfGranted(state: PermissionState) {
      if (cancelled || state !== "granted" || hasSyncedRef.current) return;
      hasSyncedRef.current = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          void updateLocationAction(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Permission was granted but the fix failed (e.g. hardware/location
          // services off) — nothing to do, the last saved location stands.
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 }
      );
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        syncIfGranted(status.state);
        // Catches the case where the user grants permission later in this
        // session (e.g. via the Settings sync button, or the browser prompt).
        status.onchange = () => syncIfGranted(status.state);
      })
      .catch(() => {
        // Permissions API unsupported (older Safari) — skip silent sync;
        // the user can still sync manually from Settings.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
