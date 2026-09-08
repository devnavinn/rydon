import { NextResponse } from "next/server";

// Group chat isn't implemented yet.
export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
