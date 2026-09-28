import Link from "next/link";

import { requireStaff } from "@/lib/auth";
import { getAdminOverview, listReports } from "@/features/admin/server/queries";
import { ReportList } from "@/components/admin/report-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  await requireStaff();
  const [stats, { reports }] = await Promise.all([
    getAdminOverview(),
    listReports({ status: "OPEN", page: 1 }),
  ]);

  const tiles = [
    { label: "Open reports", value: stats.open, href: "/admin/reports?status=OPEN", alert: stats.open > 0 },
    { label: "In review", value: stats.reviewing, href: "/admin/reports?status=REVIEWING" },
    { label: "Closed this week", value: stats.resolvedThisWeek, href: "/admin/reports?status=ALL" },
    { label: "Riders", value: stats.totalUsers, href: "/admin/users" },
    { label: "New this week", value: stats.newUsersThisWeek, href: "/admin/users" },
    { label: "Suspended", value: stats.suspendedUsers, href: "/admin/users?filter=suspended" },
    { label: "Live rides", value: stats.liveRides },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => {
          const body = (
            <Card className="h-full transition-colors hover:bg-white/[0.02]">
              <CardContent>
                <p className={`font-heading text-3xl ${tile.alert ? "text-destructive" : "text-primary"}`}>
                  {tile.value}
                </p>
                <p className="text-xs text-muted-foreground">{tile.label}</p>
              </CardContent>
            </Card>
          );
          return tile.href ? (
            <Link key={tile.label} href={tile.href}>
              {body}
            </Link>
          ) : (
            <div key={tile.label}>{body}</div>
          );
        })}
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Oldest open reports</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/reports">View queue</Link>
          </Button>
        </div>
        <ReportList reports={reports.slice(0, 5)} emptyMessage="Inbox zero — no open reports." />
      </section>
    </div>
  );
}
