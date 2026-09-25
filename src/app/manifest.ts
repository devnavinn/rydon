import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rydo — Find your riding brotherhood",
    short_name: "Rydo",
    description: "Find motorcycle riders near you, plan group rides, and ride together.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#17120e",
    theme_color: "#17120e",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
