import type { Bike } from "@prisma/client";

import { deleteBikeAction, setPrimaryBikeAction } from "@/features/profile/server/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddBikeForm } from "@/components/settings/add-bike-form";

export function BikesSection({ bikes }: { bikes: Bike[] }) {
  return (
    <div className="flex flex-col gap-4">
      {bikes.length > 0 ? (
        <div className="flex flex-col gap-2">
          {bikes.map((bike) => (
            <div
              key={bike.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {bike.brand} {bike.model} {bike.variant ?? ""} {bike.year ? `(${bike.year})` : ""}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {[bike.color, bike.registrationNo, bike.engineCc ? `${bike.engineCc}cc` : null]
                    .filter(Boolean)
                    .join(" · ") || "No further details"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {bike.isPrimary ? (
                  <Badge variant="secondary">Primary</Badge>
                ) : (
                  <form action={setPrimaryBikeAction.bind(null, bike.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      Set primary
                    </Button>
                  </form>
                )}
                <form action={deleteBikeAction.bind(null, bike.id)}>
                  <Button type="submit" variant="destructive" size="icon-sm" aria-label="Remove bike">
                    ×
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No bikes added yet.</p>
      )}

      <AddBikeForm />
    </div>
  );
}
