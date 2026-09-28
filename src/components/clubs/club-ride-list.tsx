import Link from "next/link";
import { Calendar, Users } from "lucide-react";

import { formatRideDay, formatRideTime } from "@/features/rides/format";
import type { ClubRideDTO } from "@/features/clubs/types";

export function ClubRideList({ rides }: { rides: ClubRideDTO[] }) {
  return (
    <ul className="flex flex-col divide-y divide-white/8">
      {rides.map((ride) => (
        <li key={ride.id}>
          <Link href={`/rides/${ride.id}`} className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0 hover:opacity-80">
            <p className="text-sm font-medium">{ride.title}</p>
            <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" /> {formatRideDay(new Date(ride.rideDate))}, {formatRideTime(new Date(ride.meetupTime))}
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-3" /> {ride.memberCount}/{ride.maxRiders}
              </span>
              <span className="truncate">
                {ride.startLocationName} → {ride.destinationName}
              </span>
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
