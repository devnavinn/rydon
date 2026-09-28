import Link from "next/link";
import type { ReportStatus } from "@prisma/client";

import { requireStaff } from "@/lib/auth";
import { REPORT_STATUSES } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { listReports } from "@/features/admin/server/queries";
import { ReportList } from "@/components/admin/report-list";
import { Pagination } from "@/components/admin/pagination";

const FILTERS = [...REPORT_STATUSES, "ALL"] as const;
type Filter = (typeof FILTERS)[number];

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  await requireStaff();
  const status: Filter = FILTERS.includes(params.status as Filter) ? (params.status as Filter) : "OPEN";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const { reports, total, pageCount } = await listReports({ status: status as ReportStatus | "ALL", page });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((filter) => (
          <Link
            key={filter}
            href={`/admin/reports?status=${filter}`}
            className={cn(
              "rounded-full border border-white/8 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
              filter === status && "border-primary bg-primary/10 text-primary"
            )}
          >
            {filter === "ALL" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
          </Link>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{total} reports</span>
      </div>

      <ReportList
        reports={reports}
        emptyMessage={status === "OPEN" ? "Inbox zero — no open reports." : "No reports here."}
      />
      <Pagination page={page} pageCount={pageCount} basePath="/admin/reports" params={{ status }} />
    </div>
  );
}
