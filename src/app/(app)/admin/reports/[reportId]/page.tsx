import Link from "next/link";
import { notFound } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { requireStaff } from "@/lib/auth";
import { getReportDetail } from "@/features/admin/server/queries";
import { cancelRideAction, removeMessageAction } from "@/features/admin/server/actions";
import type { ReportPerson, ReportTarget } from "@/features/reports/types";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { ReportStatusBadge } from "@/components/admin/report-status-badge";
import { ReviewReportForm } from "@/components/admin/review-report-form";
import { SuspendToggle } from "@/components/admin/suspend-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function PersonLink({ person }: { person: ReportPerson }) {
  return (
    <Link href={`/riders/${person.username}`} className="font-medium hover:underline">
      {person.fullName} <span className="text-muted-foreground">@{person.username}</span>
    </Link>
  );
}

function PersonRow({ label, person, isActive }: { label: string; person: ReportPerson; isActive: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{label}</span>
        <PersonLink person={person} />
        {!isActive ? <Badge variant="destructive">Suspended</Badge> : null}
      </div>
      <SuspendToggle userId={person.id} username={person.username} isActive={isActive} />
    </div>
  );
}

function TargetPanel({ target }: { target: ReportTarget }) {
  if ("missing" in target) {
    return <p className="text-sm text-muted-foreground">This {target.type.toLowerCase()} has since been deleted.</p>;
  }

  switch (target.type) {
    case "USER":
      return <PersonRow label="Rider" person={target.user} isActive={target.user.isActive} />;

    case "RIDE":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Link href={`/rides/${target.ride.id}`} className="flex items-center gap-1 font-medium hover:underline">
                {target.ride.title} <ExternalLink className="size-3" />
              </Link>
              <Badge variant="secondary">{target.ride.status}</Badge>
            </div>
            {target.ride.status !== "CANCELLED" && target.ride.status !== "COMPLETED" ? (
              <AdminActionButton
                action={cancelRideAction.bind(null, target.ride.id)}
                label="Cancel ride"
                pendingLabel="Cancelling…"
                variant="destructive"
                confirmMessage={`Cancel "${target.ride.title}"? The host will be notified.`}
              />
            ) : null}
          </div>
          <PersonRow label="Host" person={target.host} isActive={target.host.isActive} />
        </div>
      );

    case "GROUP":
      return (
        <Link href={`/rides/${target.group.rideId}`} className="flex items-center gap-1 text-sm font-medium hover:underline">
          {target.group.name} <ExternalLink className="size-3" />
        </Link>
      );

    case "MESSAGE":
      return (
        <div className="flex flex-col gap-3">
          <blockquote className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-sm">
            {target.message.body ?? <span className="text-muted-foreground">(no text)</span>}
            <footer className="mt-1 text-xs text-muted-foreground">
              {format(new Date(target.message.createdAt), "PPp")} ·{" "}
              <Link href={`/rides/${target.message.rideId}`} className="hover:underline">
                open ride room
              </Link>
            </footer>
          </blockquote>
          <div className="flex items-center justify-between gap-2">
            {target.message.isDeleted ? (
              <Badge variant="outline">Removed from chat</Badge>
            ) : (
              <AdminActionButton
                action={removeMessageAction.bind(null, target.message.id)}
                label="Remove message"
                pendingLabel="Removing…"
                variant="destructive"
                confirmMessage="Remove this message from the group chat?"
              />
            )}
          </div>
          <PersonRow label="Sender" person={target.sender} isActive={target.sender.isActive} />
        </div>
      );
  }
}

export default async function AdminReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  await requireStaff();
  const report = await getReportDetail(reportId);
  if (!report) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/reports" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to queue
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{report.targetType}</Badge>
            <CardTitle>{report.reason}</CardTitle>
            <ReportStatusBadge status={report.status} />
          </div>
          <CardDescription>
            Reported by <PersonLink person={report.reporter} />{" "}
            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.details ? (
            <p className="whitespace-pre-wrap text-sm">{report.details}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No extra details given.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reported {report.targetType.toLowerCase()}</CardTitle>
          <CardDescription>Take action directly — then record the outcome below.</CardDescription>
        </CardHeader>
        <CardContent>
          <TargetPanel target={report.target} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outcome</CardTitle>
          <CardDescription>
            {report.reviewedBy && report.reviewedAt
              ? `Last updated by @${report.reviewedBy.username} ${formatDistanceToNow(new Date(report.reviewedAt), { addSuffix: true })}.`
              : "Not picked up yet."}{" "}
            The reporter is notified when this is resolved or rejected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewReportForm reportId={report.id} status={report.status} note={report.resolutionNote} />
        </CardContent>
      </Card>

      {report.history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Other reports against this {report.targetType.toLowerCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {report.history.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={`/admin/reports/${h.id}`} className="hover:underline">
                    {h.reason}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(h.createdAt), { addSuffix: true })}
                    <ReportStatusBadge status={h.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
