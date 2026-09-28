import Link from "next/link";
import { Route, Users } from "lucide-react";

import { clubPath, JOIN_POLICY_SHORT } from "@/features/clubs/constants";
import type { ClubSummary } from "@/features/clubs/types";
import { ClubAvatar } from "@/components/clubs/club-avatar";
import { Badge } from "@/components/ui/badge";

export function ClubCard({ club, tag }: { club: ClubSummary; tag?: string }) {
  return (
    <Link
      href={clubPath(club.slug)}
      className="flex items-center gap-3 rounded-xl border border-white/8 bg-card p-3 transition-colors hover:bg-white/[0.03]"
    >
      <ClubAvatar name={club.name} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{club.name}</p>
          {tag ? <Badge variant="secondary">{tag}</Badge> : null}
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {club.city ? <span>{club.city}</span> : null}
          <span className="flex items-center gap-1">
            <Users className="size-3" /> {club.memberCount} {club.memberCount === 1 ? "member" : "members"}
          </span>
          {club.upcomingRideCount > 0 ? (
            <span className="flex items-center gap-1">
              <Route className="size-3" /> {club.upcomingRideCount} upcoming
            </span>
          ) : null}
          <span>{JOIN_POLICY_SHORT[club.joinPolicy]}</span>
        </p>
      </div>
    </Link>
  );
}
