import type { RideStatus } from "@prisma/client";

const EDIT_LOCK_WINDOW_MS = 24 * 60 * 60 * 1000;

const EDITABLE_STATUSES: RideStatus[] = ["DRAFT", "PUBLISHED", "FULL"];

/**
 * A ride can be edited up until 24h before its `rideDate`. If that date
 * passes without the host ever starting the ride, editing re-opens —
 * a stale, never-started ride shouldn't stay permanently locked just
 * because its original date came and went.
 */
export function canEditRide(
  ride: { status: RideStatus; rideDate: string | Date },
  now: Date = new Date()
): boolean {
  if (!EDITABLE_STATUSES.includes(ride.status)) return false;

  const rideDate = new Date(ride.rideDate);
  const lockStartsAt = new Date(rideDate.getTime() - EDIT_LOCK_WINDOW_MS);

  const beforeLockWindow = now < lockStartsAt;
  const passedWithoutStarting = now > rideDate;

  return beforeLockWindow || passedWithoutStarting;
}
