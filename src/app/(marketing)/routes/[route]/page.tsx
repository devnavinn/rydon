import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Gauge, MapPin } from "lucide-react";

import { haversineDistanceKm } from "@/lib/geo";
import { CITY_BY_SLUG, ROUTE_BY_SLUG, cityPath, routePath, routesFromCity } from "@/features/places/data";
import { getRouteRides } from "@/features/places/server/queries";
import { LandingRideCard } from "@/components/places/landing-ride-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapView } from "@/components/map/map-view";

type Props = { params: Promise<{ route: string }> };

const loadRoute = cache(async (slug: string) => {
  const route = ROUTE_BY_SLUG.get(slug);
  const city = route ? CITY_BY_SLUG.get(route.fromCity) : undefined;
  if (!route || !city) return null;
  return { route, city, rides: await getRouteRides(route) };
});

function zoomForDistance(km: number) {
  if (km < 60) return 9;
  if (km < 150) return 8;
  if (km < 350) return 7;
  return 6;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { route: slug } = await params;
  const data = await loadRoute(slug);
  if (!data) return { title: "Route", robots: { index: false, follow: false } };
  const { route, city, rides } = data;

  const title = `${city.name} to ${route.destination.name} bike ride`;
  const description = `${route.blurb} About ${route.approxKm} km from ${city.name}. ${
    rides.length > 0
      ? `${rides.length} group ${rides.length === 1 ? "ride" : "rides"} planned — join one on Rydo.`
      : "Find riders and plan a group ride on Rydo."
  }`;

  return {
    title,
    description,
    alternates: { canonical: routePath(route.slug) },
    openGraph: { title: `${title} — Rydo`, description, url: routePath(route.slug) },
  };
}

export default async function RoutePage({ params }: Props) {
  const { route: slug } = await params;
  const data = await loadRoute(slug);
  if (!data) notFound();
  const { route, city, rides } = data;

  const from = city.center;
  const to = route.destination.point;
  const otherRoutes = routesFromCity(city.slug).filter((r) => r.slug !== route.slug);
  const hostNext = encodeURIComponent("/rides/create");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-col gap-4">
        <nav className="text-xs text-muted-foreground">
          <Link href="/routes" className="hover:text-foreground">
            Routes
          </Link>{" "}
          /{" "}
          <Link href={cityPath(city.slug)} className="hover:text-foreground">
            {city.name}
          </Link>{" "}
          / {route.destination.name}
        </nav>
        <h1 className="font-heading text-4xl tracking-wide sm:text-5xl">
          {city.name} to {route.destination.name} bike ride
        </h1>
        <p className="max-w-2xl text-muted-foreground">{route.blurb}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5">
            <Gauge className="size-4 text-primary" />~{route.approxKm} km one way
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" />
            {city.name}, {city.state} → {route.destination.name}
          </span>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border" style={{ height: 320 }}>
        <MapView
          center={[(from.lat + to.lat) / 2, (from.lng + to.lng) / 2]}
          zoom={zoomForDistance(haversineDistanceKm(from, to))}
          markers={[
            { id: "start", lat: from.lat, lng: from.lng, kind: "start", label: city.name },
            { id: "destination", lat: to.lat, lng: to.lng, kind: "destination", label: route.destination.name },
          ]}
        />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl tracking-wide">
          Group rides to {route.destination.name}
        </h2>
        {rides.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rides.map((ride) => (
              <LandingRideCard key={ride.slug} ride={ride} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-white/12 bg-transparent">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-medium">No rides planned on this route yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Host one and riders in {city.name} will see it. Set the start, destination and time, then approve
                who joins.
              </p>
              <Button asChild size="sm">
                <Link href={`/sign-up?next=${hostNext}`}>Plan this ride</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl tracking-wide">More from {city.name}</h2>
        <div className="flex flex-col gap-2">
          {otherRoutes.map((r) => (
            <Link
              key={r.slug}
              href={routePath(r.slug)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowRight className="size-3.5" />
              {city.name} to {r.destination.name} (~{r.approxKm} km)
            </Link>
          ))}
          <Link
            href={cityPath(city.slug)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowRight className="size-3.5" />
            All group rides in {city.name}
          </Link>
        </div>
      </section>
    </div>
  );
}
