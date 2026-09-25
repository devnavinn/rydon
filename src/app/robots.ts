import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/app-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const appUrl = await getAppUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/r/"],
      // Opengraph images live under /r/ and must stay crawlable; everything
      // signed-in is also marked noindex, this just saves crawl budget.
      disallow: [
        "/api/",
        "/track/",
        "/dashboard",
        "/settings",
        "/chat/",
        "/notifications",
        "/onboarding",
        "/saved-rides",
        "/profile",
        "/map",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
