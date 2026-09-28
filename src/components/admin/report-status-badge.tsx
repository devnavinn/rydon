import type { ReportStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const VARIANT: Record<ReportStatus, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "destructive",
  REVIEWING: "default",
  RESOLVED: "secondary",
  REJECTED: "outline",
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge variant={VARIANT[status]}>{status}</Badge>;
}
