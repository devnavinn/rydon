"use client";

import { createContext, useContext } from "react";

export type MapplsConfig = { token?: string; style?: string };

const MapplsConfigContext = createContext<MapplsConfig>({});

/** Carries the Mappls settings read from server env down to client map components. */
export function MapplsConfigProvider({ config, children }: { config: MapplsConfig; children: React.ReactNode }) {
  return <MapplsConfigContext.Provider value={config}>{children}</MapplsConfigContext.Provider>;
}

export function useMapplsConfig() {
  return useContext(MapplsConfigContext);
}
