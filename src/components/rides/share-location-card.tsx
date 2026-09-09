"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { Check, Copy, MapPinned } from "lucide-react";

import { useTrackingLink } from "@/features/tracking/queries";
import { useShareLocation, useStopSharing } from "@/features/tracking/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ShareLocationCard({
  rideId,
  emergencySharingOn,
}: {
  rideId: string;
  emergencySharingOn: boolean;
}) {
  const { data: link, isLoading } = useTrackingLink(rideId);
  const share = useShareLocation(rideId);
  const stop = useStopSharing(rideId);
  const [copied, setCopied] = useState(false);

  if (!emergencySharingOn) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <MapPinned className="size-4" /> Live location sharing
        </p>
        <p className="text-xs text-muted-foreground">
          Turn on live location sharing in{" "}
          <Link href="/settings" className="underline underline-offset-2">
            Settings
          </Link>{" "}
          to share a tracking link for this ride.
        </p>
      </div>
    );
  }

  if (isLoading) return null;

  const url = link ? `${window.location.origin}/track/${link.token}` : null;

  function handleCopy() {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <MapPinned className="size-4" /> Live location sharing
      </p>
      {link && url ? (
        <>
          <div className="flex gap-1.5">
            <Input readOnly value={url} className="text-xs" onFocus={(e) => e.target.select()} />
            <Button type="button" variant="outline" size="icon-sm" onClick={handleCopy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Expires {formatDistanceToNowStrict(new Date(link.expiresAt), { addSuffix: true })}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => stop.mutate()}
              disabled={stop.isPending}
            >
              Stop sharing
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Share a live-location link with anyone — no account needed on their end.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => share.mutate()}
            disabled={share.isPending}
            className="self-start"
          >
            {share.isPending ? "Creating link..." : "Share my live location"}
          </Button>
        </>
      )}
    </div>
  );
}
