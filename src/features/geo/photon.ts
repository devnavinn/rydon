/**
 * Thin client for Photon (photon.komoot.io) — a free, key-less address
 * search/geocoding API built for typeahead use. No account or billing
 * required; it's a public instance run by komoot on top of OpenStreetMap
 * data, which also backs the map tiles already used in this app.
 */

export type PlaceSuggestion = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

type PhotonProperties = {
  name?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  osm_id?: number;
  osm_type?: string;
};

type PhotonFeature = {
  properties: PhotonProperties;
  geometry: { coordinates: [number, number] }; // [lng, lat]
};

type PhotonResponse = {
  features: PhotonFeature[];
};

function formatLabel(props: PhotonProperties): string {
  const streetPart = [props.housenumber, props.street].filter(Boolean).join(" ");
  const parts = [props.name, streetPart, props.city, props.state, props.country];

  const seen = new Set<string>();
  const unique = parts.filter((part): part is string => {
    if (!part) return false;
    const key = part.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.join(", ");
}

export async function searchPlaces(
  query: string,
  options: { near?: { lat: number; lng: number }; limit?: number; signal?: AbortSignal } = {}
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(options.limit ?? 6),
  });
  if (options.near) {
    params.set("lat", String(options.near.lat));
    params.set("lon", String(options.near.lng));
  }

  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    signal: options.signal,
  });
  if (!res.ok) throw new Error("Location search failed");

  const data = (await res.json()) as PhotonResponse;

  return data.features
    .map((feature, index) => {
      const [lng, lat] = feature.geometry.coordinates;
      const label = formatLabel(feature.properties);
      return { id: `${feature.properties.osm_type ?? "place"}-${feature.properties.osm_id ?? index}`, label, lat, lng };
    })
    .filter((result) => result.label.length > 0);
}
