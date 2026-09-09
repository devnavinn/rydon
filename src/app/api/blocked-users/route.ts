import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { listBlockedUsers } from "@/features/blocking/server/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const blockedUsers = await listBlockedUsers(user.id);
  return NextResponse.json({ blockedUsers });
}
