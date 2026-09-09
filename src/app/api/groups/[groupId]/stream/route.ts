import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { isGroupMember } from "@/features/groups/server/queries";
import { sseResponse } from "@/lib/realtime";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthenticated", { status: 401 });

  const { groupId } = await params;
  if (!(await isGroupMember(groupId, session.user.id))) {
    return new Response("Not a member of this group", { status: 403 });
  }

  return sseResponse(`group:${groupId}`, request);
}
