import { getCurrentUser } from "@/lib/auth";
import { MapExplorer } from "@/components/map/map-explorer";

export default async function MapPage() {
  const user = await getCurrentUser();
  const fallback =
    user?.riderProfile?.latitude != null && user?.riderProfile?.longitude != null
      ? { lat: user.riderProfile.latitude, lng: user.riderProfile.longitude }
      : null;

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Local Map</h1>
        <p className="text-sm text-muted-foreground">
          Riders and rides happening around you, live-style.
        </p>
      </div>
      <MapExplorer fallback={fallback} />
    </div>
  );
}
