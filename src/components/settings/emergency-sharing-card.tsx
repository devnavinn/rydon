import { toggleEmergencySharingAction } from "@/features/profile/server/actions";
import { Button } from "@/components/ui/button";

export function EmergencySharingCard({ emergencySharingOn }: { emergencySharingOn: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">Live location sharing</p>
        <p className="text-xs text-muted-foreground">
          {emergencySharingOn
            ? "Your primary emergency contact can see your live location during rides."
            : "Turn this on to share your live location with your primary emergency contact during rides."}
        </p>
      </div>
      <form action={toggleEmergencySharingAction}>
        <Button type="submit" variant={emergencySharingOn ? "secondary" : "outline"} size="sm">
          {emergencySharingOn ? "On" : "Off"}
        </Button>
      </form>
    </div>
  );
}
