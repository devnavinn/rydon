"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MapplsConfigProvider, type MapplsConfig } from "@/components/map/mappls-config";

export function Providers({ children, mappls }: { children: React.ReactNode; mappls: MapplsConfig }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MapplsConfigProvider config={mappls}>{children}</MapplsConfigProvider>
    </QueryClientProvider>
  );
}
