import { getCurrentUser } from "@/lib/auth";
import { listAdminClubs } from "@/features/clubs/server/queries";
import { RideForm } from "@/components/rides/ride-form";

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]; // Bengaluru

export default async function CreateRidePage({ searchParams }: { searchParams: Promise<{ club?: string }> }) {
  const user = await getCurrentUser();
  const [clubs, { club: clubSlug }] = await Promise.all([
    user ? listAdminClubs(user.id) : Promise.resolve([]),
    searchParams,
  ]);
  const defaultClub = clubs.find((c) => c.slug === clubSlug);
  const center: [number, number] =
    user?.riderProfile?.latitude != null && user?.riderProfile?.longitude != null
      ? [user.riderProfile.latitude, user.riderProfile.longitude]
      : DEFAULT_CENTER;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Create a Ride</h1>
        <p className="text-sm text-muted-foreground">
          Set the meetup point, the destination, and invite the brotherhood.
        </p>
      </div>
      <RideForm center={center} clubs={clubs} defaultClubId={defaultClub?.id} />
    </div>
  );
}
