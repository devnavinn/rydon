import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { sseResponse } from "@/lib/realtime";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthenticated", { status: 401 });

  return sseResponse(`user:${session.user.id}`, request);
}
