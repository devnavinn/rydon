import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { createReportSchema } from "@/features/reports/validators";
import { createReport, ReportError } from "@/features/reports/server/mutations";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const parsed = createReportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid report" }, { status: 400 });
  }

  try {
    const report = await createReport(user.id, parsed.data);
    return NextResponse.json({ id: report.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ReportError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
