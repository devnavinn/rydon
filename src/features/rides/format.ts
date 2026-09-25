import { DISPLAY_TIME_ZONE } from "@/lib/constants";

/** "Sat, 27 Sep" */
export function formatRideDay(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: DISPLAY_TIME_ZONE,
  });
}

/** "6:30 am" */
export function formatRideTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
  });
}

/** "BREAKFAST" → "Breakfast" */
export function formatRideStyle(style: string): string {
  return style.charAt(0) + style.slice(1).toLowerCase();
}

/** Canonical public URL path for a ride. */
export function publicRidePath(slug: string): string {
  return `/r/${slug}`;
}
