"use client";

import { useActionState } from "react";
import type { ReportStatus } from "@prisma/client";

import { reviewReportAction } from "@/features/admin/server/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReviewReportForm({
  reportId,
  status,
  note,
}: {
  reportId: string;
  status: ReportStatus;
  note: string | null;
}) {
  const [state, formAction, isPending] = useActionState(reviewReportAction, { error: null });
  const isClosed = status === "RESOLVED" || status === "REJECTED";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-note">Internal note</Label>
        <Textarea
          id="review-note"
          name="note"
          defaultValue={note ?? ""}
          placeholder="What you found and what you did — only staff see this."
          maxLength={1000}
          rows={3}
        />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {status === "OPEN" ? (
          <Button type="submit" name="status" value="REVIEWING" variant="secondary" size="sm" disabled={isPending}>
            Start review
          </Button>
        ) : null}
        {!isClosed ? (
          <>
            <Button type="submit" name="status" value="RESOLVED" size="sm" disabled={isPending}>
              Resolve — action taken
            </Button>
            <Button type="submit" name="status" value="REJECTED" variant="outline" size="sm" disabled={isPending}>
              Reject — no violation
            </Button>
          </>
        ) : (
          <>
            <Button type="submit" name="status" value={status} variant="secondary" size="sm" disabled={isPending}>
              Save note
            </Button>
            <Button type="submit" name="status" value="OPEN" variant="outline" size="sm" disabled={isPending}>
              Reopen
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
