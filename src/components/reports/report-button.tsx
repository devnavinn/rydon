"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

import { useSubmitReport } from "@/features/reports/mutations";
import { REPORT_REASONS } from "@/features/reports/validators";
import type { REPORT_TARGET_TYPES } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Reason = (typeof REPORT_REASONS)[number];

export function ReportButton({
  targetType,
  targetId,
  targetLabel,
  compact = false,
}: {
  targetType: (typeof REPORT_TARGET_TYPES)[number];
  targetId: string;
  /** e.g. "@rider" or a ride title — shown in the dialog so people know what they're reporting. */
  targetLabel: string;
  /** Tiny text trigger for dense spots like chat bubbles. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState("");
  const submit = useSubmitReport();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setReason(null);
      setDetails("");
      submit.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {compact ? (
          <button type="button" className="text-[11px] text-muted-foreground hover:text-destructive">
            Report
          </button>
        ) : (
          <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
            <Flag className="size-3.5" /> Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        {submit.isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Thanks for letting us know</DialogTitle>
              <DialogDescription>
                Our moderators will review it. You&apos;ll get a notification once they&apos;ve made a call.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!reason) return;
              submit.mutate({ targetType, targetId, reason, details: details.trim() || undefined });
            }}
          >
            <DialogHeader>
              <DialogTitle>Report {targetLabel}</DialogTitle>
              <DialogDescription>Reports are confidential — they won&apos;t know it was you.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Reason">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={reason === r}
                  onClick={() => setReason(r)}
                  className={cn(
                    "rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                    reason === r && "border-primary bg-primary/10 text-primary"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-details">What happened? (optional)</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={1000}
                rows={4}
              />
            </div>

            {submit.error ? <p className="text-sm text-destructive">{submit.error.message}</p> : null}

            <DialogFooter>
              <Button type="submit" variant="destructive" disabled={!reason || submit.isPending}>
                {submit.isPending ? "Sending…" : "Send report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
