import { formatDistanceKm } from "@/lib/geo";
import type { RideDetail } from "@/features/rides/types";
import type { MemberProgress } from "@/features/rides/hooks";

export function ProgressPanel({
  ride,
  progress,
  totalDistanceKm,
}: {
  ride: RideDetail;
  progress: Map<string, MemberProgress>;
  totalDistanceKm: number;
}) {
  const riders = ride.members.filter((m) => m.status === "JOINED");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Route distance</span>
        <span className="font-medium text-foreground">{formatDistanceKm(totalDistanceKm)}</span>
      </div>
      {riders.map((member) => {
        const p = progress.get(member.userId);
        const pct = p ? Math.round(p.fraction * 100) : 0;
        return (
          <div key={member.userId} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{member.fullName}</span>
              <span className="text-muted-foreground">
                {p?.arrived ? "Arrived" : p ? `ETA ${p.etaMinutes} min` : "Not started"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
