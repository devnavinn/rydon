import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postLocationSchema } from "@/features/groups/validators";
import { isGroupMember, getLatestPositions } from "@/features/groups/server/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { groupId } = await params;
  if (!(await isGroupMember(groupId, user.id))) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
  }

  const positions = await getLatestPositions(groupId);
  return NextResponse.json({ positions });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { groupId } = await params;
  if (!(await isGroupMember(groupId, user.id))) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = postLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.locationPing.create({
    data: {
      groupId,
      userId: user.id,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      speedKph: parsed.data.speedKph,
      heading: parsed.data.heading,
    },
  });

  return NextResponse.json({ ok: true });
}
