import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/app-url";
import { listPublicRideSlugs } from "@/features/rides/server/queries";
import { publicRidePath } from "@/features/rides/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [appUrl, rides] = await Promise.all([getAppUrl(), listPublicRideSlugs()]);

  return [
    { url: appUrl, changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/about`, changeFrequency: "monthly" },
    { url: `${appUrl}/safety`, changeFrequency: "monthly" },
    ...rides.map((ride) => ({
      url: `${appUrl}${publicRidePath(ride.slug)}`,
      lastModified: ride.updatedAt,
      changeFrequency: "daily" as const,
    })),
  ];
}
