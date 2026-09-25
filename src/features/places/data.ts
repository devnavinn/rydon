import { haversineDistanceKm, type LatLng } from "@/lib/geo";

/**
 * Curated SEO landing pages. Kept to a fixed list (rather than one page per
 * free-text location riders type) so every page is a real place with enough
 * activity to be worth indexing — thin near-duplicate pages hurt the whole site.
 */

export type City = {
  slug: string;
  name: string;
  state: string;
  center: LatLng;
  /** Rides starting / riders living within this distance count as "in" the city. */
  radiusKm: number;
};

export type RideRoute = {
  slug: string;
  fromCity: string; // City.slug
  destination: { name: string; point: LatLng };
  /** Approximate one-way road distance, for display only. */
  approxKm: number;
  blurb: string;
};

export const CITIES: City[] = [
  { slug: "bengaluru", name: "Bengaluru", state: "Karnataka", center: { lat: 12.9716, lng: 77.5946 }, radiusKm: 40 },
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", center: { lat: 19.076, lng: 72.8777 }, radiusKm: 40 },
  { slug: "delhi", name: "Delhi NCR", state: "Delhi", center: { lat: 28.6139, lng: 77.209 }, radiusKm: 45 },
  { slug: "pune", name: "Pune", state: "Maharashtra", center: { lat: 18.5204, lng: 73.8567 }, radiusKm: 30 },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana", center: { lat: 17.385, lng: 78.4867 }, radiusKm: 40 },
  { slug: "chennai", name: "Chennai", state: "Tamil Nadu", center: { lat: 13.0827, lng: 80.2707 }, radiusKm: 35 },
  { slug: "kolkata", name: "Kolkata", state: "West Bengal", center: { lat: 22.5726, lng: 88.3639 }, radiusKm: 35 },
  { slug: "ahmedabad", name: "Ahmedabad", state: "Gujarat", center: { lat: 23.0225, lng: 72.5714 }, radiusKm: 30 },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", center: { lat: 26.9124, lng: 75.7873 }, radiusKm: 25 },
  { slug: "chandigarh", name: "Chandigarh", state: "Chandigarh", center: { lat: 30.7333, lng: 76.7794 }, radiusKm: 25 },
  { slug: "kochi", name: "Kochi", state: "Kerala", center: { lat: 9.9312, lng: 76.2673 }, radiusKm: 25 },
  { slug: "goa", name: "Goa", state: "Goa", center: { lat: 15.4909, lng: 73.8278 }, radiusKm: 40 },
  { slug: "lucknow", name: "Lucknow", state: "Uttar Pradesh", center: { lat: 26.8467, lng: 80.9462 }, radiusKm: 25 },
  { slug: "indore", name: "Indore", state: "Madhya Pradesh", center: { lat: 22.7196, lng: 75.8577 }, radiusKm: 25 },
  { slug: "dehradun", name: "Dehradun", state: "Uttarakhand", center: { lat: 30.3165, lng: 78.0322 }, radiusKm: 25 },
  { slug: "guwahati", name: "Guwahati", state: "Assam", center: { lat: 26.1445, lng: 91.7362 }, radiusKm: 25 },
];

export const ROUTES: RideRoute[] = [
  {
    slug: "bengaluru-to-nandi-hills",
    fromCity: "bengaluru",
    destination: { name: "Nandi Hills", point: { lat: 13.3702, lng: 77.6835 } },
    approxKm: 60,
    blurb: "The classic sunrise breakfast ride out of Bengaluru.",
  },
  {
    slug: "bengaluru-to-coorg",
    fromCity: "bengaluru",
    destination: { name: "Coorg", point: { lat: 12.4244, lng: 75.7382 } },
    approxKm: 250,
    blurb: "A weekend run to coffee country in the Western Ghats.",
  },
  {
    slug: "bengaluru-to-chikmagalur",
    fromCity: "bengaluru",
    destination: { name: "Chikmagalur", point: { lat: 13.3161, lng: 75.772 } },
    approxKm: 245,
    blurb: "Hill roads and coffee estates, a favourite weekend tour.",
  },
  {
    slug: "mumbai-to-lonavala",
    fromCity: "mumbai",
    destination: { name: "Lonavala", point: { lat: 18.7546, lng: 73.4062 } },
    approxKm: 83,
    blurb: "Up the ghats for a monsoon or breakfast ride.",
  },
  {
    slug: "mumbai-to-goa",
    fromCity: "mumbai",
    destination: { name: "Goa", point: { lat: 15.4909, lng: 73.8278 } },
    approxKm: 590,
    blurb: "The big coastal tour — plan a multi-day run with your crew.",
  },
  {
    slug: "pune-to-mahabaleshwar",
    fromCity: "pune",
    destination: { name: "Mahabaleshwar", point: { lat: 17.9237, lng: 73.6586 } },
    approxKm: 120,
    blurb: "Twisties and strawberry farms, an easy weekend ride.",
  },
  {
    slug: "delhi-to-rishikesh",
    fromCity: "delhi",
    destination: { name: "Rishikesh", point: { lat: 30.0869, lng: 78.2676 } },
    approxKm: 240,
    blurb: "Head for the Ganga and the foothills of the Himalayas.",
  },
  {
    slug: "delhi-to-jaipur",
    fromCity: "delhi",
    destination: { name: "Jaipur", point: { lat: 26.9124, lng: 75.7873 } },
    approxKm: 280,
    blurb: "A straight highway run to the Pink City.",
  },
  {
    slug: "chennai-to-pondicherry",
    fromCity: "chennai",
    destination: { name: "Pondicherry", point: { lat: 11.9416, lng: 79.8083 } },
    approxKm: 150,
    blurb: "The East Coast Road — sea on one side the whole way.",
  },
  {
    slug: "kolkata-to-digha",
    fromCity: "kolkata",
    destination: { name: "Digha", point: { lat: 21.6266, lng: 87.5074 } },
    approxKm: 185,
    blurb: "Kolkata's go-to weekend beach ride.",
  },
  {
    slug: "hyderabad-to-ananthagiri-hills",
    fromCity: "hyderabad",
    destination: { name: "Ananthagiri Hills", point: { lat: 17.312, lng: 77.8615 } },
    approxKm: 80,
    blurb: "Forest roads and viewpoints, close enough for a morning ride.",
  },
  {
    slug: "kochi-to-munnar",
    fromCity: "kochi",
    destination: { name: "Munnar", point: { lat: 10.0889, lng: 77.0595 } },
    approxKm: 130,
    blurb: "Climb through tea gardens into the hills.",
  },
  {
    slug: "chandigarh-to-kasol",
    fromCity: "chandigarh",
    destination: { name: "Kasol", point: { lat: 32.01, lng: 77.315 } },
    approxKm: 260,
    blurb: "Into the Parvati Valley — a mountain weekend.",
  },
  {
    slug: "dehradun-to-mussoorie",
    fromCity: "dehradun",
    destination: { name: "Mussoorie", point: { lat: 30.4598, lng: 78.0644 } },
    approxKm: 35,
    blurb: "A short climb with big views, perfect for a quick ride.",
  },
];

export const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));
export const ROUTE_BY_SLUG = new Map(ROUTES.map((r) => [r.slug, r]));

export function routesFromCity(citySlug: string) {
  return ROUTES.filter((r) => r.fromCity === citySlug);
}

/** How close a ride's destination must be to a route's destination to count as that route. */
export const ROUTE_DESTINATION_RADIUS_KM = 30;

export function cityPath(slug: string) {
  return `/cities/${slug}`;
}

export function routePath(slug: string) {
  return `/routes/${slug}`;
}

/** Nearest curated city to a point, if it's within that city's radius. */
export function cityForPoint(point: LatLng): City | null {
  let best: { city: City; km: number } | null = null;
  for (const city of CITIES) {
    const km = haversineDistanceKm(city.center, point);
    if (km <= city.radiusKm && (!best || km < best.km)) best = { city, km };
  }
  return best?.city ?? null;
}
