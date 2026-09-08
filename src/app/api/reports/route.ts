import { NextResponse } from "next/server";

// Moderation/reporting isn't implemented yet.
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
