import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CITIES, cityPath, routePath, routesFromCity } from "@/features/places/data";

export const metadata: Metadata = {
  title: "Popular motorcycle routes in India",
  description:
    "Classic bike rides from Indian cities — Bengaluru to Nandi Hills, Mumbai to Lonavala, Delhi to Rishikesh, Chennai to Pondicherry and more. Find a group to ride with.",
  alternates: { canonical: "/routes" },
};

export default function RoutesPage() {
  const groups = CITIES.map((city) => ({ city, routes: routesFromCity(city.slug) })).filter(
    (g) => g.routes.length > 0
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl tracking-wide sm:text-5xl">Popular motorcycle routes</h1>
        <p className="max-w-2xl text-muted-foreground">
          The rides every crew does at least once. Find a group heading out, or plan one yourself.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {groups.map(({ city, routes }) => (
          <section key={city.slug} className="flex flex-col gap-2">
            <h2 className="font-heading text-xl tracking-wide">
              <Link href={cityPath(city.slug)} className="hover:text-primary">
                From {city.name}
              </Link>
            </h2>
            {routes.map((route) => (
              <Link
                key={route.slug}
                href={routePath(route.slug)}
                className="group flex items-start gap-2 text-sm"
              >
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>
                  <span className="font-medium group-hover:text-primary">{route.destination.name}</span>{" "}
                  <span className="text-muted-foreground">
                    ~{route.approxKm} km · {route.blurb}
                  </span>
                </span>
              </Link>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
