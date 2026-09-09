import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { listNotifications, getUnreadCount } from "@/features/notifications/server/queries";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/features/notifications/server/mutations";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const userId = session.user.id;

  const cursor = request.nextUrl.searchParams.get("cursor");
  const [{ notifications, nextCursor }, unreadCount] = await Promise.all([
    listNotifications(userId, cursor),
    getUnreadCount(userId),
  ]);

  return NextResponse.json({ notifications, nextCursor, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const userId = session.user.id;

  const body = await request.json().catch(() => ({}));

  if (body.action === "read_all") {
    await markAllNotificationsRead(userId);
  } else if (body.action === "read" && typeof body.id === "string") {
    await markNotificationRead(userId, body.id);
  } else {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
