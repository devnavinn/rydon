"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, Popup, Source, Layer, type MapRef } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { useSmoothedPosition } from "@/hooks/use-smoothed-position";
import { MarkerDot, type MarkerKind } from "@/components/map/marker-dot";

export type { MarkerKind };

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

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

function SmoothMarker({ marker }: { marker: MapMarker }) {
  const { lat, lng } = useSmoothedPosition(marker.lat, marker.lng);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Marker
        latitude={lat}
        longitude={lng}
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setOpen(true);
        }}
      >
        <MarkerDot kind={marker.kind} pulse={marker.pulse} />
      </Marker>
      {open ? (
        <Popup latitude={lat} longitude={lng} closeButton onClose={() => setOpen(false)} offset={12}>
          <p className="font-medium">{marker.label}</p>
          {marker.sublabel ? <p className="text-muted-foreground">{marker.sublabel}</p> : null}
        </Popup>
      ) : null}
    </>
  );
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
  const mapRef = useRef<MapRef>(null);
  const [centerLat, centerLng] = center;

  useEffect(() => {
    mapRef.current?.getMap().easeTo({ center: [centerLng, centerLat], duration: 800 });
  }, [centerLat, centerLng]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={className ?? "h-full w-full"}>
        <div className="flex h-full w-full items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground">
          Map unavailable — missing Mapbox access token.
        </div>
      </div>
    );
  }

  return (
    <div className={className ?? "h-full w-full"}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ latitude: centerLat, longitude: centerLng, zoom }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        onClick={(e: MapMouseEvent) => onMapClick?.(e.lngLat.lat, e.lngLat.lng)}
      >
        {routes?.map((route) => (
          <Source
            key={route.id}
            id={`route-${route.id}`}
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: route.points.map(([lat, lng]) => [lng, lat]),
              },
            }}
          >
            <Layer
              id={`route-line-${route.id}`}
              type="line"
              paint={{ "line-color": "#94a3b8", "line-width": 3, "line-dasharray": [2, 2] }}
            />
          </Source>
        ))}
        {markers.map((marker) => (
          <SmoothMarker key={marker.id} marker={marker} />
        ))}
      </Map>
    </div>
  );
}
