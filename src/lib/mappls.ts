/** Minimal typings for the parts of the Mappls (MapmyIndia) Web SDK v3 we use. */
export type MapplsLatLng = { lat: number; lng: number };

export type MapplsMouseEvent = { lngLat?: MapplsLatLng; originalEvent?: Event };

export type MapplsMap = {
  addListener(event: string, handler: (e: MapplsMouseEvent) => void): void;
  panTo(center: [number, number], options?: { duration?: number }): void;
  resize?(): void;
  remove(): void;
};

export type MapplsMarker = {
  setPosition(position: MapplsLatLng): void;
};

export type MapplsPolyline = object;

export type MapplsSdk = {
  Map(id: string, properties: Record<string, unknown>): MapplsMap;
  Marker(options: Record<string, unknown>): MapplsMarker;
  Polyline(options: Record<string, unknown>): MapplsPolyline;
  remove(options: { map: MapplsMap; layer: MapplsMarker | MapplsPolyline }): void;
  setStyle(name: string): void;
};

declare global {
  interface Window {
    mappls?: MapplsSdk;
  }
}

let sdkPromise: Promise<MapplsSdk> | null = null;

/** Injects the Mappls Web SDK script once and resolves with `window.mappls`. */
export function loadMapplsSdk(accessToken: string): Promise<MapplsSdk> {
  if (window.mappls) return Promise.resolve(window.mappls);
  if (sdkPromise) return sdkPromise;

  const params = new URLSearchParams({ v: "3.0", access_token: accessToken });

  sdkPromise = new Promise<MapplsSdk>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://sdk.mappls.com/map/sdk/web?${params}`;
    script.async = true;
    script.onload = () =>
      window.mappls ? resolve(window.mappls) : reject(new Error("Mappls SDK loaded without window.mappls"));
    script.onerror = () => reject(new Error("Failed to load Mappls SDK"));
    document.head.appendChild(script);
  }).catch((err) => {
    sdkPromise = null;
    throw err;
  });

  return sdkPromise;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}
