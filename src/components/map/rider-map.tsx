"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { coloredIcon, type MarkerKind } from "@/components/map/leaflet-icons";

const ALL_KINDS: MarkerKind[] = [
  "self",
  "online",
  "riding",
  "offline",
  "ride",
  "start",
  "destination",
];

function iconKey(kind: MarkerKind, pulse?: boolean) {
  return `${kind}:${pulse ? 1 : 0}`;
}

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

function ClickCapture({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
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
  const icons = useMemo(() => {
    const entries: [string, ReturnType<typeof coloredIcon>][] = [];
    for (const kind of ALL_KINDS) {
      for (const pulse of [false, true]) {
        entries.push([iconKey(kind, pulse), coloredIcon(kind, pulse)]);
      }
    }
    return new Map(entries);
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className={className ?? "h-full w-full"}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onMapClick ? <ClickCapture onClick={onMapClick} /> : null}
      {routes?.map((route) => (
        <Polyline
          key={route.id}
          positions={route.points}
          pathOptions={{ color: "#94a3b8", weight: 3, dashArray: "6 6" }}
        />
      ))}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={icons.get(iconKey(marker.kind, marker.pulse))}
        >
          <Popup>
            <p className="font-medium">{marker.label}</p>
            {marker.sublabel ? (
              <p className="text-muted-foreground">{marker.sublabel}</p>
            ) : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
