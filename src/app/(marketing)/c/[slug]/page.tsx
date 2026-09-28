import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MapPin, Route, Users } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { clubPath, publicClubPath } from "@/features/clubs/constants";
import { getClubDetail } from "@/features/clubs/server/queries";
import { ClubAvatar } from "@/components/clubs/club-avatar";
import { ClubRideList } from "@/components/clubs/club-ride-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// generateMetadata and the page both need the club — dedupe to one query.
const loadClub = cache(getClubDetail);

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ invite?: string }> };

function summary(club: { name: string; city: string | null; memberCount: number }) {
  return `${club.name} is a riding club${club.city ? ` in ${club.city}` : ""} with ${club.memberCount} ${club.memberCount === 1 ? "rider" : "riders"} on Rydo. Join them for their next ride.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = await loadClub(slug);
  if (!club || club.joinPolicy === "INVITE_ONLY") {
    return { title: "Riding club", robots: { index: false, follow: false } };
  }

  const description = summary(club);
  const url = publicClubPath(club.slug);
  return {
    title: club.name,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "Rydo", title: club.name, description, url },
    twitter: { card: "summary", title: club.name, description },
  };
}

export default async function PublicClubPage({ params, searchParams }: Props) {
  const [{ slug }, { invite }] = await Promise.all([params, searchParams]);
  const club = await loadClub(slug);
  if (!club) notFound();

  const inviteCode = invite && invite.toLowerCase() === club.inviteCode ? club.inviteCode : null;
  if (club.joinPolicy === "INVITE_ONLY" && !inviteCode) notFound();

  const appPath = `${clubPath(club.slug)}${inviteCode ? `?invite=${inviteCode}` : ""}`;
  if (await getCurrentUser()) redirect(appPath);
  const next = encodeURIComponent(appPath);

  const leaders = club.members.filter((m) => m.role !== "MEMBER");
  const publicRides = club.upcomingRides.filter((r) => r.visibility === "PUBLIC");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-10">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <ClubAvatar name={club.name} className="size-20 text-3xl" />
          <div>
            <h1 className="font-heading text-3xl tracking-wide">{club.name}</h1>
            <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 text-sm text-muted-foreground">
              {club.city ? (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" /> {club.city}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <Users className="size-3.5" /> {club.memberCount} {club.memberCount === 1 ? "member" : "members"}
              </span>
              {club.upcomingRideCount > 0 ? (
                <span className="flex items-center gap-1">
                  <Route className="size-3.5" /> {club.upcomingRideCount} upcoming {club.upcomingRideCount === 1 ? "ride" : "rides"}
                </span>
              ) : null}
            </p>
          </div>
          {club.description ? <p className="max-w-prose whitespace-pre-wrap text-sm">{club.description}</p> : null}
          {leaders.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Led by {leaders.map((m) => m.fullName).join(", ")}
            </p>
          ) : null}

          <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
            <Button asChild size="lg" className="w-full">
              <Link href={`/sign-up?next=${next}`}>
                {inviteCode ? `Join ${club.name}` : "Join Rydo to ride with them"}
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Already riding with Rydo?{" "}
              <Link href={`/sign-in?next=${next}`} className="font-medium text-foreground underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {publicRides.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming rides</CardTitle>
          </CardHeader>
          <CardContent>
            <ClubRideList rides={publicRides} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
