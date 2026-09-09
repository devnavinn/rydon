import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { listSavedRides } from "@/features/saved-rides/server/queries";
import { SavedRidesList } from "@/components/saved-rides/saved-rides-list";

export default async function SavedRidesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const savedRides = await listSavedRides(user.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Saved rides</h1>
        <p className="text-sm text-muted-foreground">Rides you&apos;ve bookmarked for later.</p>
      </div>
      <SavedRidesList initialData={savedRides} />
    </div>
  );
}
