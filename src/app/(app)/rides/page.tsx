import { getCurrentUser } from "@/lib/auth";
import { RidesListView } from "@/components/rides/rides-list-view";

export default async function RidesPage() {
  const user = await getCurrentUser();
  const fallback =
    user?.riderProfile?.latitude != null && user?.riderProfile?.longitude != null
      ? { lat: user.riderProfile.latitude, lng: user.riderProfile.longitude }
      : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Rides</h1>
        <p className="text-sm text-muted-foreground">Public rides happening near you.</p>
      </div>
      <RidesListView fallback={fallback} />
    </div>
  );
}
