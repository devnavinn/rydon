import "server-only";

import { prisma } from "@/lib/prisma";
import { boundingBox, haversineDistanceKm, type LatLng } from "@/lib/geo";
import {
  CITY_BY_SLUG,
  ROUTE_DESTINATION_RADIUS_KM,
  type City,
  type RideRoute,
} from "@/features/places/data";
import type { LandingRide } from "@/features/places/types";

// Rides dated "today" stay listed until the day is over.
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const LISTED_STATUSES = ["PUBLISHED", "FULL", "ONGOING"] as const;

/** Upcoming public rides starting near `center`, optionally ending near `destination`. */
async function findLandingRides(
  start: { center: LatLng; radiusKm: number },
  destination: { center: LatLng; radiusKm: number } | null,
  take: number
): Promise<LandingRide[]> {
  const startBox = boundingBox(start.center, start.radiusKm);
  const destBox = destination ? boundingBox(destination.center, destination.radiusKm) : null;

  const rides = await prisma.ride.findMany({
    where: {
      visibility: "PUBLIC",
      status: { in: [...LISTED_STATUSES] },
      rideDate: { gte: startOfToday() },
      startLatitude: { gte: startBox.minLat, lte: startBox.maxLat },
      startLongitude: { gte: startBox.minLng, lte: startBox.maxLng },
      ...(destBox
        ? {
            destinationLatitude: { gte: destBox.minLat, lte: destBox.maxLat },
            destinationLongitude: { gte: destBox.minLng, lte: destBox.maxLng },
          }
        : {}),
    },
    select: {
      slug: true,
      title: true,
      style: true,
      status: true,
      rideDate: true,
      meetupTime: true,
      startLocationName: true,
      startLatitude: true,
      startLongitude: true,
      destinationName: true,
      destinationLatitude: true,
      destinationLongitude: true,
      maxRiders: true,
      _count: { select: { members: { where: { status: "JOINED" } } } },
    },
    orderBy: { meetupTime: "asc" },
    take: take * 2, // the box is a square — some get dropped by the exact radius check
  });

  return rides
    .filter((ride) => {
      const s = { lat: Number(ride.startLatitude), lng: Number(ride.startLongitude) };
      if (haversineDistanceKm(start.center, s) > start.radiusKm) return false;
      if (!destination) return true;
      const d = { lat: Number(ride.destinationLatitude), lng: Number(ride.destinationLongitude) };
      return haversineDistanceKm(destination.center, d) <= destination.radiusKm;
    })
    .slice(0, take)
    .map((ride) => ({
      slug: ride.slug,
      title: ride.title,
      style: ride.style,
      status: ride.status,
      rideDate: ride.rideDate,
      meetupTime: ride.meetupTime,
      startLocationName: ride.startLocationName,
      destinationName: ride.destinationName,
      memberCount: ride._count.members,
      maxRiders: ride.maxRiders,
    }));
}

export function getCityRides(city: City, take = 12) {
  return findLandingRides({ center: city.center, radiusKm: city.radiusKm }, null, take);
}

export function getRouteRides(route: RideRoute, take = 12) {
  const city = CITY_BY_SLUG.get(route.fromCity);
  if (!city) return Promise.resolve([]);
  return findLandingRides(
    { center: city.center, radiusKm: city.radiusKm },
    { center: route.destination.point, radiusKm: ROUTE_DESTINATION_RADIUS_KM },
    take
  );
}

/** Riders with a completed profile whose last known location is in the city (bounding-box approximation). */
export async function countCityRiders(city: City): Promise<number> {
  const box = boundingBox(city.center, city.radiusKm);
  return prisma.riderProfile.count({
    where: {
      profileCompleted: true,
      latitude: { gte: box.minLat, lte: box.maxLat },
      longitude: { gte: box.minLng, lte: box.maxLng },
    },
  });
}

/**
 * Pages with nothing going on are thin content — keep them out of the index
 * (and sitemap) until the city has rides or a few riders.
 */
export const MIN_RIDERS_TO_INDEX = 5;

export function isCityIndexable(rideCount: number, riderCount: number) {
  return rideCount > 0 || riderCount >= MIN_RIDERS_TO_INDEX;
}
