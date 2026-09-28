import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";

import type { ReportListItem } from "@/features/reports/types";
import { ReportStatusBadge } from "@/components/admin/report-status-badge";
import { Badge } from "@/components/ui/badge";

export function ReportList({ reports, emptyMessage }: { reports: ReportListItem[]; emptyMessage: string }) {
  if (reports.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-white/8 overflow-hidden rounded-xl border border-white/8">
      {reports.map((report) => (
        <li key={report.id}>
          <Link
            href={`/admin/reports/${report.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{report.targetType}</Badge>
                <span className="truncate text-sm font-medium">{report.targetLabel}</span>
                {report.relatedCount > 0 ? (
                  <span className="text-xs text-destructive">+{report.relatedCount} other reports</span>
                ) : null}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {report.reason} · by @{report.reporter.username} ·{" "}
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </p>
            </div>
            <ReportStatusBadge status={report.status} />
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
