import { NextResponse } from "next/server";

// No external webhook providers are wired up yet.
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
