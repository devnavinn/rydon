"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useSmoothedPosition } from "@/hooks/use-smoothed-position";
import { markerDotHtml, type MarkerKind } from "@/components/map/marker-dot";
import { useMapplsConfig } from "@/components/map/mappls-config";
import { escapeHtml, loadMapplsSdk, type MapplsMap, type MapplsSdk } from "@/lib/mappls";

export type { MarkerKind };

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  kind: MarkerKind;
  label: string;
  sublabel?: string;
  pulse?: boolean;
};

export type MapRoute = {
  id: string;
  points: [number, number][];
};

type MapContext = { sdk: MapplsSdk; map: MapplsMap };

// React runs the map's unmount cleanup before its children's, and the SDK throws when
// removing a layer from a destroyed map — so children skip removal once the map is gone.
const removedMaps = new WeakSet<MapplsMap>();

function removeLayer(ctx: MapContext, layer: Parameters<MapplsSdk["remove"]>[0]["layer"]) {
  if (removedMaps.has(ctx.map)) return;
  ctx.sdk.remove({ map: ctx.map, layer });
}

function SmoothMarker({ ctx, marker }: { ctx: MapContext; marker: MapMarker }) {
  const { lat, lng } = useSmoothedPosition(marker.lat, marker.lng);
  const markerRef = useRef<ReturnType<MapplsSdk["Marker"]> | null>(null);
  const positionRef = useRef({ lat, lng });

  const { kind, pulse, label, sublabel } = marker;

  // Mappls markers can't swap their HTML in place, so appearance changes recreate the marker.
  useEffect(() => {
    const popupHtml =
      `<p class="font-medium">${escapeHtml(label)}</p>` +
      (sublabel ? `<p class="text-muted-foreground">${escapeHtml(sublabel)}</p>` : "");
    const instance = ctx.sdk.Marker({
      map: ctx.map,
      position: positionRef.current,
      html: markerDotHtml(kind, pulse),
      popupHtml,
    });
    markerRef.current = instance;
    return () => {
      removeLayer(ctx, instance);
      markerRef.current = null;
    };
  }, [ctx, kind, pulse, label, sublabel]);

  useEffect(() => {
    positionRef.current = { lat, lng };
    markerRef.current?.setPosition({ lat, lng });
  }, [lat, lng]);

  return null;
}

function RouteLine({ ctx, points }: { ctx: MapContext; points: [number, number][] }) {
  const pointsKey = JSON.stringify(points);

  useEffect(() => {
    const path = (JSON.parse(pointsKey) as [number, number][]).map(([lat, lng]) => ({ lat, lng }));
    if (path.length < 2) return;
    const instance = ctx.sdk.Polyline({
      map: ctx.map,
      path,
      strokeColor: "#94a3b8",
      strokeWeight: 3,
      dasharray: [2, 2],
    });
    return () => removeLayer(ctx, instance);
  }, [ctx, pointsKey]);

  return null;
}

export function RiderMap({
  center,
  zoom = 12,
  markers,
  routes,
  onMapClick,
  className,
}: {
  center: [number, number];
  zoom?: number;
  markers: MapMarker[];
  routes?: MapRoute[];
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}) {
  const { token, style } = useMapplsConfig();
  const containerId = `rydo-map-${useId().replace(/:/g, "")}`;
  const [ctx, setCtx] = useState<MapContext | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [centerLat, centerLng] = center;

  const initialViewRef = useRef({ center: [centerLat, centerLng], zoom });
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let map: MapplsMap | null = null;

    loadMapplsSdk(token, style)
      .then((sdk) => {
        if (cancelled) return;
        map = sdk.Map(containerId, { ...initialViewRef.current, zoomControl: true });
        map.addListener("load", () => {
          if (!cancelled && map) setCtx({ sdk, map });
        });
        map.addListener("click", (e) => {
          // Clicks on a marker bubble to the map; treat those as marker clicks only.
          if ((e.originalEvent?.target as Element | undefined)?.closest?.("[data-rydo-marker]")) return;
          if (e.lngLat) onMapClickRef.current?.(e.lngLat.lat, e.lngLat.lng);
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      setCtx(null);
      if (map) {
        removedMaps.add(map);
        map.remove();
      }
    };
  }, [containerId, token, style]);

  useEffect(() => {
    ctx?.map.panTo([centerLng, centerLat], { duration: 800 });
  }, [ctx, centerLat, centerLng]);

  if (!token || loadError) {
    return (
      <div className={className ?? "h-full w-full"}>
        <div className="flex h-full w-full items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground">
          {token ? "Map unavailable — failed to load Mappls." : "Map unavailable — missing Mappls access token."}
        </div>
      </div>
    );
  }

  return (
    <div className={className ?? "h-full w-full"}>
      <div id={containerId} style={{ width: "100%", height: "100%" }} />
      {ctx ? (
        <>
          {routes?.map((route) => <RouteLine key={route.id} ctx={ctx} points={route.points} />)}
          {markers.map((marker) => (
            <SmoothMarker key={marker.id} ctx={ctx} marker={marker} />
          ))}
        </>
      ) : null}
    </div>
  );
}
