import type { Metadata } from "next";
import Link from "next/link";

import { CITIES, cityPath, routesFromCity } from "@/features/places/data";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Motorcycle group rides by city",
  description: "Find biker groups and group rides in Bengaluru, Mumbai, Delhi, Pune, Hyderabad, Chennai and more.",
  alternates: { canonical: "/cities" },
};

export default function CitiesPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl tracking-wide sm:text-5xl">Group rides by city</h1>
        <p className="max-w-2xl text-muted-foreground">
          Pick your city to see upcoming group rides and the riders around you.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CITIES.map((city) => {
          const routeCount = routesFromCity(city.slug).length;
          return (
            <Link key={city.slug} href={cityPath(city.slug)} className="group">
              <Card className="h-full border-white/8 transition-colors group-hover:border-primary/40">
                <CardContent className="flex flex-col gap-1">
                  <p className="font-medium group-hover:text-primary">{city.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {city.state}
                    {routeCount > 0 ? ` · ${routeCount} popular ${routeCount === 1 ? "route" : "routes"}` : ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
