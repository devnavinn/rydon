import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Route as RouteIcon, Users } from "lucide-react";

import { CITIES, CITY_BY_SLUG, cityPath, routePath, routesFromCity } from "@/features/places/data";
import { countCityRiders, getCityRides, isCityIndexable } from "@/features/places/server/queries";
import { LandingRideCard } from "@/components/places/landing-ride-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = { params: Promise<{ city: string }> };

// generateMetadata and the page need the same numbers — one round of queries.
const loadCity = cache(async (slug: string) => {
  const city = CITY_BY_SLUG.get(slug);
  if (!city) return null;
  const [rides, riders] = await Promise.all([getCityRides(city), countCityRiders(city)]);
  return { city, rides, riders };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const data = await loadCity(slug);
  if (!data) return { title: "City", robots: { index: false, follow: false } };
  const { city, rides, riders } = data;
  const description = `Find motorcycle group rides and riders in ${city.name}. ${
    rides.length > 0 ? `${rides.length} upcoming ${rides.length === 1 ? "ride" : "rides"} — ` : ""
  }breakfast rides, highway runs and weekend tours. Join free on Rydo.`;

  return {
    title: `Motorcycle group rides in ${city.name}`,
    description,
    alternates: { canonical: cityPath(city.slug) },
    robots: isCityIndexable(rides.length, riders) ? undefined : { index: false, follow: true },
    openGraph: { title: `Group rides in ${city.name} — Rydo`, description, url: cityPath(city.slug) },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: slug } = await params;
  const data = await loadCity(slug);
  if (!data) notFound();
  const { city, rides, riders } = data;
  const routes = routesFromCity(city.slug);
  const otherCities = CITIES.filter((c) => c.slug !== city.slug);
  const hostNext = encodeURIComponent("/rides/create");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-col gap-4">
        <nav className="text-xs text-muted-foreground">
          <Link href="/cities" className="hover:text-foreground">
            Cities
          </Link>{" "}
          / {city.name}
        </nav>
        <h1 className="font-heading text-4xl tracking-wide sm:text-5xl">Motorcycle group rides in {city.name}</h1>
        <p className="max-w-2xl text-muted-foreground">
          Meet riders around {city.name}, {city.state} and join group rides: sunrise breakfast runs, highway
          rides and weekend tours. Pick a ride, request a spot, and roll out with the pack.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5">
            <RouteIcon className="size-4 text-primary" />
            {rides.length} upcoming {rides.length === 1 ? "ride" : "rides"}
          </span>
          {riders > 0 ? (
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-primary" />
              {riders} {riders === 1 ? "rider" : "riders"} nearby
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/sign-up">Join riders in {city.name}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/sign-up?next=${hostNext}`}>Host a ride</Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl tracking-wide">Upcoming rides</h2>
        {rides.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rides.map((ride) => (
              <LandingRideCard key={ride.slug} ride={ride} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-white/12 bg-transparent">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-medium">No rides planned in {city.name} yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Be the first. Host a ride and riders nearby will see it on their map.
              </p>
              <Button asChild size="sm">
                <Link href={`/sign-up?next=${hostNext}`}>Host the first ride</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {routes.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl tracking-wide">Popular rides from {city.name}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {routes.map((route) => (
              <Link key={route.slug} href={routePath(route.slug)} className="group">
                <Card className="h-full border-white/8 transition-colors group-hover:border-primary/40">
                  <CardContent className="flex items-center gap-3">
                    <MapPin className="size-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium group-hover:text-primary">
                        {city.name} to {route.destination.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ~{route.approxKm} km · {route.blurb}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl tracking-wide">Group rides in other cities</h2>
        <div className="flex flex-wrap gap-2">
          {otherCities.map((c) => (
            <Link
              key={c.slug}
              href={cityPath(c.slug)}
              className="rounded-full border border-white/10 px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
