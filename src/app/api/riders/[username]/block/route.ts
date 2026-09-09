import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blockUser, unblockUser } from "@/features/blocking/server/mutations";

async function resolveTarget(username: string) {
  return prisma.user.findUnique({ where: { username }, select: { id: true } });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { username } = await params;
  const target = await resolveTarget(username);
  if (!target) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

  try {
    await blockUser(user.id, target.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to block rider";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { username } = await params;
  const target = await resolveTarget(username);
  if (!target) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

  await unblockUser(user.id, target.id);
  return NextResponse.json({ ok: true });
}
