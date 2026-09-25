import type { Metadata } from "next";
import Link from "next/link";
import { Users, Map, Route, Radar, UsersRound, Flag, ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getAppUrl } from "@/lib/app-url";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const FEATURES = [
  {
    icon: Radar,
    title: "Find riders nearby",
    description:
      "See local riders with their distance, bike, and status — online, riding now, or offline. No more riding alone.",
  },
  {
    icon: Map,
    title: "Live-style local map",
    description:
      "Riders and rides plotted around you in real time, filterable by radius and riding style.",
  },
  {
    icon: Route,
    title: "Plan the ride",
    description:
      "Set a start, destination, date, and time — invite the crew and watch RSVPs roll in.",
  },
  {
    icon: Flag,
    title: "Live ride rooms",
    description:
      "Once you roll out, track group progress, ETA, and pack size together in one room.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Set your radius",
    description: "Tell Rydo how far you're willing to ride to meet the brotherhood.",
  },
  {
    step: "02",
    title: "Find your crew",
    description: "Browse nearby riders and open rides, filtered by style — breakfast, highway, off-road.",
  },
  {
    step: "03",
    title: "Roll out together",
    description: "Host or join a ride, get approved, and track the pack live once you're on the road.",
  },
];

export default async function MarketingHome() {
  const [user, riderCount, rideCount, cityGroups] = await Promise.all([
    getCurrentUser(),
    prisma.riderProfile.count(),
    prisma.ride.count(),
    prisma.riderProfile.findMany({
      where: { city: { not: null } },
      select: { city: true },
      distinct: ["city"],
    }),
  ]);

  const stats = [
    { label: "Riders on Rydo", value: `${Math.max(riderCount, 1)}+` },
    { label: "Rides hosted", value: `${Math.max(rideCount, 1)}+` },
    { label: "Cities", value: `${Math.max(cityGroups.length, 1)}+` },
  ];

  const appUrl = await getAppUrl();
  // Lets search engines show the site name (not just the domain) on results.
  const jsonLd = JSON.stringify([
    { "@context": "https://schema.org", "@type": "WebSite", name: "Rydo", url: appUrl },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Rydo",
      url: appUrl,
      logo: `${appUrl}/icon.png`,
    },
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {/* Hero */}
      <section className="bg-garage-glow bg-grain relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 bg-garage-stripes opacity-60" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-7 px-6 py-28 text-center sm:py-36">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium tracking-wide text-primary uppercase">
            <span className="size-1.5 rounded-full bg-primary" />
            Built for riders, by riders
          </span>
          <h1 className="font-heading text-balance text-6xl leading-[0.95] tracking-wide sm:text-7xl md:text-8xl">
            Find your riding
            <br />
            <span className="text-primary">brotherhood.</span>
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground sm:text-xl">
            Rydo connects local motorcyclists — discover riders near you, plan group rides,
            and roll out together with a live-style progress room.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Button asChild size="lg" className="h-12 px-8 text-base font-semibold">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="h-12 px-8 text-base font-semibold">
                  <Link href="/sign-up">Join the brotherhood</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </>
            )}
          </div>

          <dl className="mt-10 grid w-full max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-heading text-4xl text-primary sm:text-5xl">{stat.value}</dd>
                <span className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-medium tracking-widest text-primary uppercase">
            Everything you need to ride together
          </span>
          <h2 className="font-heading text-4xl tracking-wide sm:text-5xl">
            One app, the whole pack.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-xl border border-white/8 bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </div>
              <p className="mb-1.5 font-heading text-xl tracking-wide">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-white/5 bg-card/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 flex flex-col items-center gap-3 text-center">
            <span className="text-xs font-medium tracking-widest text-primary uppercase">
              How it works
            </span>
            <h2 className="font-heading text-4xl tracking-wide sm:text-5xl">Three steps to the road.</h2>
          </div>
          <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div className="pointer-events-none absolute top-6 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent sm:block" />
            {STEPS.map(({ step, title, description }) => (
              <div key={step} className="relative flex flex-col items-center gap-3 text-center">
                <span className="flex size-12 items-center justify-center rounded-full border border-primary/40 bg-background font-heading text-xl text-primary">
                  {step}
                </span>
                <p className="font-heading text-xl tracking-wide">{title}</p>
                <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Ride notes, helmet requirements, and pillion rules on every ride you host.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UsersRound className="size-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Host approval keeps your ride group exactly who you invited.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Users className="size-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Real profiles, real bikes — every rider shows their ride.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5">
        <div className="bg-garage-glow absolute inset-0" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
          <h2 className="font-heading text-balance text-4xl tracking-wide sm:text-5xl">
            Your next ride starts with your next rider.
          </h2>
          <p className="max-w-md text-muted-foreground">
            Join Rydo and find the brotherhood waiting a few kilometers down the road.
          </p>
          <Button asChild size="lg" className="h-12 px-10 text-base font-semibold">
            <Link href="/sign-up">Join the brotherhood</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
