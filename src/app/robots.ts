import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/app-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const appUrl = await getAppUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/r/"],
      disallow: ["/api/", "/track/", "/dashboard", "/settings", "/chat/", "/notifications"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
