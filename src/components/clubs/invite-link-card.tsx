"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2 } from "lucide-react";

import { regenerateInviteAction } from "@/features/clubs/server/actions";
import { ActionButton } from "@/components/shared/action-button";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

export function InviteLinkCard({ clubId, clubName, inviteUrl }: { clubId: string; clubName: string; inviteUrl: string }) {
  const [copied, setCopied] = useState(false);
  // Web Share is client-only; reading it during render would mismatch the server HTML.
  const canShare = useSyncExternalStore(noopSubscribe, () => "share" in navigator, () => false);

  async function copy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    try {
      await navigator.share({ title: `Join ${clubName} on Rydo`, url: inviteUrl });
    } catch {
      // Dismissed share sheet — nothing to do.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Drop this in your club&apos;s WhatsApp group. Anyone who opens it joins straight away — no approval —
        including riders who aren&apos;t on Rydo yet.
      </p>
      <div className="flex gap-2">
        <code className="flex-1 truncate rounded-md border border-white/8 bg-white/[0.03] px-3 py-2 text-xs">
          {inviteUrl}
        </code>
        <Button type="button" variant="secondary" size="sm" onClick={copy} className="h-auto">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        {canShare ? (
          <Button type="button" variant="secondary" size="sm" onClick={share} className="h-auto" aria-label="Share">
            <Share2 className="size-3.5" />
          </Button>
        ) : null}
      </div>
      <ActionButton
        action={regenerateInviteAction.bind(null, clubId)}
        label="Reset link"
        pendingLabel="Resetting…"
        variant="ghost"
        size="xs"
        confirmMessage="Reset the invite link? The old link will stop working."
      />
    </div>
  );
}
