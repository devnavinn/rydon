import { NextResponse } from "next/server";

import { resolveTrackingLink, getLivePosition } from "@/features/tracking/server/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const info = await resolveTrackingLink(token);
  if (!info) return NextResponse.json({ error: "Link expired or not found" }, { status: 404 });
  if (!info.groupId) return NextResponse.json({ position: null });

  const position = await getLivePosition(info.groupId, info.userId);
  return NextResponse.json({ position });
}
