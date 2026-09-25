import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/app-url";
import { listPublicRideSlugs } from "@/features/rides/server/queries";
import { publicRidePath } from "@/features/rides/format";
import { CITIES, ROUTES, cityPath, routePath } from "@/features/places/data";
import { countCityRiders, getCityRides, isCityIndexable } from "@/features/places/server/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [appUrl, rides, cities] = await Promise.all([
    getAppUrl(),
    listPublicRideSlugs(),
    // Same rule as the city page's robots tag — only list cities worth indexing.
    Promise.all(
      CITIES.map(async (city) => {
        const [cityRides, riders] = await Promise.all([getCityRides(city, 1), countCityRiders(city)]);
        return isCityIndexable(cityRides.length, riders) ? city : null;
      })
    ),
  ]);

  return [
    { url: appUrl, changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/about`, changeFrequency: "monthly" },
    { url: `${appUrl}/safety`, changeFrequency: "monthly" },
    { url: `${appUrl}/sign-up`, changeFrequency: "monthly" },
    { url: `${appUrl}/cities`, changeFrequency: "weekly" },
    { url: `${appUrl}/routes`, changeFrequency: "weekly" },
    ...cities
      .filter((city) => city !== null)
      .map((city) => ({ url: `${appUrl}${cityPath(city.slug)}`, changeFrequency: "daily" as const })),
    ...ROUTES.map((route) => ({ url: `${appUrl}${routePath(route.slug)}`, changeFrequency: "weekly" as const })),
    ...rides.map((ride) => ({
      url: `${appUrl}${publicRidePath(ride.slug)}`,
      lastModified: ride.updatedAt,
      changeFrequency: "daily" as const,
    })),
  ];
}
