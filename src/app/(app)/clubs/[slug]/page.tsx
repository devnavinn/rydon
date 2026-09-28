import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, MapPin, Pencil, Plus, Users } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getAppUrl } from "@/lib/app-url";
import { clubInvitePath, JOIN_POLICY_SHORT } from "@/features/clubs/constants";
import { isClubAdmin } from "@/features/clubs/permissions";
import { getClubDetail } from "@/features/clubs/server/queries";
import { ClubAvatar } from "@/components/clubs/club-avatar";
import { ClubMemberList, PendingRequestList } from "@/components/clubs/club-member-list";
import { ClubMembershipButton } from "@/components/clubs/club-membership-button";
import { ClubRideList } from "@/components/clubs/club-ride-list";
import { InviteLinkCard } from "@/components/clubs/invite-link-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClubPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const [{ slug }, { invite }, user] = await Promise.all([params, searchParams, requireUser()]);
  const club = await getClubDetail(slug);
  if (!club) notFound();

  const self = [...club.members, ...club.pending].find((m) => m.userId === user.id);
  const membership = self ? { role: self.role, status: self.status } : null;
  const isMember = membership?.status === "ACTIVE";
  const isAdmin = isClubAdmin(membership);
  // Only honour the invite if it's the club's current code.
  const inviteCode = invite && invite.toLowerCase() === club.inviteCode ? club.inviteCode : null;

  // Invite-only clubs stay hidden from outsiders who don't hold the link.
  if (club.joinPolicy === "INVITE_ONLY" && !membership && !inviteCode) notFound();

  // Non-members only see the club's public rides, same as they would anywhere else.
  const rides = isMember ? club.upcomingRides : club.upcomingRides.filter((r) => r.visibility === "PUBLIC");
  const inviteUrl = isAdmin ? `${await getAppUrl()}${clubInvitePath(club.inviteCode)}` : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <ClubAvatar name={club.name} className="size-16 text-2xl" />
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl tracking-wide">{club.name}</h1>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {club.city ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" /> {club.city}
                  </span>
                ) : null}
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" /> {club.memberCount} {club.memberCount === 1 ? "member" : "members"}
                </span>
                <Badge variant="outline">
                  {club.joinPolicy === "INVITE_ONLY" ? <Lock className="size-3" /> : null}
                  {JOIN_POLICY_SHORT[club.joinPolicy]}
                </Badge>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <ClubMembershipButton
              clubId={club.id}
              clubName={club.name}
              joinPolicy={club.joinPolicy}
              membership={membership}
              inviteCode={inviteCode}
            />
            {isAdmin ? (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/clubs/${club.slug}/edit`}>
                  <Pencil className="size-3.5" /> Edit club
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
        {club.description ? (
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{club.description}</p>
          </CardContent>
        ) : null}
      </Card>

      {isAdmin && club.pending.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Join requests ({club.pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <PendingRequestList clubId={club.id} pending={club.pending} />
          </CardContent>
        </Card>
      ) : null}

      {inviteUrl ? (
        <Card>
          <CardHeader>
            <CardTitle>Invite your members</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteLinkCard clubId={club.id} clubName={club.name} inviteUrl={inviteUrl} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Upcoming club rides</CardTitle>
            {isAdmin ? <CardDescription>Every member is notified when you post one.</CardDescription> : null}
          </div>
          {isAdmin ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/rides/create?club=${club.slug}`}>
                <Plus className="size-3.5" /> Plan a ride
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {rides.length > 0 ? (
            <ClubRideList rides={rides} />
          ) : (
            <p className="text-sm text-muted-foreground">No rides on the calendar yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          {!isMember ? <CardDescription>Join to ride with them.</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <ClubMemberList
            clubId={club.id}
            members={club.members}
            viewerId={user.id}
            viewerRole={isAdmin ? membership!.role : null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
