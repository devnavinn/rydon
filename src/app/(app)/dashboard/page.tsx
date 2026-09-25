import Link from "next/link";
import {
  Users,
  Map,
  PlusCircle,
  Route,
  ArrowRight,
  Building2,
  Coffee,
  Sun,
  Mountain,
  Compass,
  HeartHandshake,
  Moon,
  Sparkles,
} from "lucide-react";
import type { RideStyle } from "@prisma/client";
import { format } from "date-fns";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAppUrl } from "@/lib/app-url";
import { getReferralSummary } from "@/features/referrals/server/referrals";
import { InviteCard } from "@/components/referrals/invite-card";

const QUICK_LINKS = [
  { href: "/riders", label: "Find nearby riders", icon: Users },
  { href: "/map", label: "Open the live map", icon: Map },
  { href: "/rides/create", label: "Create a ride", icon: PlusCircle },
  { href: "/rides", label: "Browse rides", icon: Route },
];

const STYLE_ICON: Record<RideStyle, React.ComponentType<{ className?: string }>> = {
  CITY: Building2,
  BREAKFAST: Coffee,
  HIGHWAY: Route,
  WEEKEND: Sun,
  OFFROAD: Mountain,
  TOURING: Compass,
  CHARITY: HeartHandshake,
  NIGHT: Moon,
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Riding late,";
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();

  const [myRides, ridesHosted, ridesJoined, upcomingCount, referralSummary, appUrl] = await Promise.all([
    prisma.rideMember.findMany({
      where: {
        userId: user.id,
        status: { in: ["JOINED", "REQUESTED"] },
        ride: { rideDate: { gte: now } },
      },
      select: {
        status: true,
        ride: {
          select: {
            id: true,
            title: true,
            style: true,
            status: true,
            rideDate: true,
            startLocationName: true,
            destinationName: true,
          },
        },
      },
      orderBy: { ride: { rideDate: "asc" } },
      take: 5,
    }),
    prisma.ride.count({ where: { hostId: user.id } }),
    prisma.rideMember.count({ where: { userId: user.id, status: "JOINED" } }),
    prisma.rideMember.count({
      where: {
        userId: user.id,
        status: { in: ["JOINED", "REQUESTED"] },
        ride: { rideDate: { gte: now } },
      },
    }),
    getReferralSummary(user.id),
    getAppUrl(),
  ]);

  const displayName = user.riderProfile?.fullName ?? user.username;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const stats = [
    { label: "Rides hosted", value: ridesHosted },
    { label: "Rides joined", value: ridesJoined },
    { label: "Upcoming", value: upcomingCount },
  ];

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="bg-garage-glow bg-garage-stripes relative border-b border-white/5">
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
              <AvatarFallback className="font-heading text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">{greeting()}</p>
              <h1 className="font-heading text-3xl tracking-wide sm:text-4xl">{displayName}</h1>
              {user.riderProfile?.city ? (
                <p className="text-sm text-muted-foreground">{user.riderProfile.city}</p>
              ) : null}
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:max-w-md">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-heading text-3xl text-primary sm:text-4xl">{stat.value}</dd>
                <span className="mt-0.5 text-xs tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full border-white/8 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-black/20">
                <CardContent className="flex flex-col items-center gap-3 py-7 text-center">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <InviteCard summary={referralSummary} origin={appUrl} />

        {/* Your rides */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-lg tracking-wide">Your upcoming rides</p>
            {myRides.length > 0 ? (
              <Link
                href="/rides"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            ) : null}
          </div>

          {myRides.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {myRides.map(({ ride, status }) => {
                const StyleIcon = STYLE_ICON[ride.style];
                return (
                  <Link key={ride.id} href={`/rides/${ride.id}`} className="group">
                    <Card className="border-white/8 transition-all duration-200 group-hover:border-primary/30 group-hover:bg-card/80">
                      <CardContent className="flex items-center gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <StyleIcon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{ride.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {format(ride.rideDate, "EEE, MMM d · h:mm a")} · {ride.startLocationName}{" "}
                            → {ride.destinationName}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {ride.style}
                          </Badge>
                          <Badge
                            variant={status === "REQUESTED" ? "secondary" : "default"}
                            className="text-[10px]"
                          >
                            {status === "REQUESTED" ? "Requested" : ride.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed border-white/12 bg-transparent">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <p className="font-medium">No rides on the calendar yet</p>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Find riders nearby or host your own ride to get the pack rolling.
                  </p>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/riders">Find riders</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/rides/create">Create a ride</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
