import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getRideDetail } from "@/features/rides/server/queries";
import { canEditRide } from "@/features/rides/permissions";
import { RideForm } from "@/components/rides/ride-form";

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]; // Bengaluru

export default async function EditRidePage({
  params,
}: {
  params: Promise<{ rideId: string }>;
}) {
  const { rideId } = await params;
  const [user, ride] = await Promise.all([getCurrentUser(), getRideDetail(rideId)]);

  if (!ride || !user) notFound();
  if (ride.hostId !== user.id) notFound();
  if (!canEditRide(ride)) redirect(`/rides/${rideId}`);

  const center: [number, number] =
    user.riderProfile?.latitude != null && user.riderProfile?.longitude != null
      ? [user.riderProfile.latitude, user.riderProfile.longitude]
      : DEFAULT_CENTER;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Edit Ride</h1>
        <p className="text-sm text-muted-foreground">
          Update the details for &quot;{ride.title}&quot;.
        </p>
      </div>
      <RideForm center={center} ride={ride} />
    </div>
  );
}
