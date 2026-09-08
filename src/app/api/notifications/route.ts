import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { listNotifications, getUnreadCount } from "@/features/notifications/server/queries";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/features/notifications/server/mutations";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const cursor = request.nextUrl.searchParams.get("cursor");
  const [{ notifications, nextCursor }, unreadCount] = await Promise.all([
    listNotifications(user.id, cursor),
    getUnreadCount(user.id),
  ]);

  return NextResponse.json({ notifications, nextCursor, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  if (body.action === "read_all") {
    await markAllNotificationsRead(user.id);
  } else if (body.action === "read" && typeof body.id === "string") {
    await markNotificationRead(user.id, body.id);
  } else {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
