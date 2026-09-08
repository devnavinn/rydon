import { getCurrentUser } from "@/lib/auth";
import { RidersView } from "@/components/riders/riders-view";

export default async function RidersPage() {
  const user = await getCurrentUser();
  const fallback =
    user?.riderProfile?.latitude != null && user?.riderProfile?.longitude != null
      ? { lat: user.riderProfile.latitude, lng: user.riderProfile.longitude }
      : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Nearby Riders</h1>
        <p className="text-sm text-muted-foreground">
          Riders in your brotherhood, sorted by distance.
        </p>
      </div>
      <RidersView fallback={fallback} />
    </div>
  );
}
