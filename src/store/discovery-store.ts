import { create } from "zustand";
import type { RideStyle } from "@prisma/client";

type DiscoveryState = {
  radiusKm: number;
  style: RideStyle | "ALL";
  setRadiusKm: (radiusKm: number) => void;
  setStyle: (style: RideStyle | "ALL") => void;
};

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  radiusKm: 25,
  style: "ALL",
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setStyle: (style) => set({ style }),
}));
