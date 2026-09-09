import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { listSavedRides } from "@/features/saved-rides/server/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const savedRides = await listSavedRides(session.user.id);
  return NextResponse.json({ savedRides });
}
