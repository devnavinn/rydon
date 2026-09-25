import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

import { formatRideDay, formatRideStyle, formatRideTime, publicRidePath } from "@/features/rides/format";
import type { LandingRide } from "@/features/places/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function LandingRideCard({ ride }: { ride: LandingRide }) {
  const spotsLeft = Math.max(ride.maxRiders - ride.memberCount, 0);

  return (
    <Link href={publicRidePath(ride.slug)} className="group">
      <Card className="h-full border-white/8 transition-all duration-200 group-hover:border-primary/40">
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">
              {formatRideStyle(ride.style)}
            </Badge>
            {ride.status === "ONGOING" ? <Badge className="text-[10px]">Riding now</Badge> : null}
          </div>
          <p className="font-medium group-hover:text-primary">{ride.title}</p>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span className="line-clamp-2">
              {ride.startLocationName.split(",")[0]} → {ride.destinationName.split(",")[0]}
            </span>
          </p>
          <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {formatRideDay(ride.rideDate)}, {formatRideTime(ride.meetupTime)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
