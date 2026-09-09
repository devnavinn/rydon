import "server-only";

import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import type { TrackingLinkDTO } from "@/features/tracking/types";

const LINK_LIFETIME_MS = 24 * 60 * 60 * 1000;

function generateToken() {
  return randomBytes(24).toString("base64url");
}

/** Reuses an existing non-expired, non-revoked link; otherwise mints a fresh token (past revocation is never resurrected). */
export async function createOrRefreshTrackingLink(
  rideId: string,
  userId: string
): Promise<TrackingLinkDTO> {
  const existing = await prisma.trackingLink.findUnique({ where: { rideId_userId: { rideId, userId } } });
  if (existing && !existing.revokedAt && existing.expiresAt > new Date()) {
    return { token: existing.token, expiresAt: existing.expiresAt.toISOString() };
  }

  const expiresAt = new Date(Date.now() + LINK_LIFETIME_MS);
  const link = await prisma.trackingLink.upsert({
    where: { rideId_userId: { rideId, userId } },
    create: { rideId, userId, token: generateToken(), expiresAt },
    update: { token: generateToken(), expiresAt, revokedAt: null },
  });

  return { token: link.token, expiresAt: link.expiresAt.toISOString() };
}

export async function revokeTrackingLink(rideId: string, userId: string) {
  await prisma.trackingLink.updateMany({
    where: { rideId, userId },
    data: { revokedAt: new Date() },
  });
}
