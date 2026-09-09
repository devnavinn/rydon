import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { isGroupMember } from "@/features/groups/server/queries";
import { listMessages } from "@/features/chat/server/queries";
import { sendMessage } from "@/features/chat/server/mutations";
import { sendMessageSchema } from "@/features/chat/validators";

// Uses `auth()` directly rather than `getCurrentUser()` — the JWT session
// already carries the user id, and this route never needs the rider profile
// fields that getCurrentUser's extra DB round trip fetches. On a
// high-latency DB connection that round trip is a meaningful chunk of send
// latency, so it's worth skipping here.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { groupId } = await params;
  if (!(await isGroupMember(groupId, session.user.id))) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");
  const { messages, nextCursor } = await listMessages(groupId, cursor);
  return NextResponse.json({ messages, nextCursor });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { groupId } = await params;
  if (!(await isGroupMember(groupId, session.user.id))) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const message = await sendMessage(groupId, session.user.id, parsed.data.body);
  return NextResponse.json({ message });
}
