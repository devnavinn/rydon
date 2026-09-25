"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Share2, UserPlus } from "lucide-react";

import { referralPath } from "@/features/referrals/constants";
import type { ReferralSummary } from "@/features/referrals/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const INVITE_TEXT = "I ride with Rydo — find riders nearby and join group rides. Join me:";

export function InviteCard({ summary, origin }: { summary: ReferralSummary; origin: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${origin}${referralPath(summary.code)}`;
  const { joinedCount, nextBadge } = summary;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your invite link", link);
    }
  }

  async function share() {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: "Join me on Rydo", text: INVITE_TEXT, url: link });
    } catch {
      // Share sheet dismissed.
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${INVITE_TEXT} ${link}`)}`;

  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <UserPlus className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-lg tracking-wide">Bring your crew</p>
            <p className="text-sm text-muted-foreground">
              Riders who join with your link count once they set up their profile. Earn badges at 1, 3 and 10.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="min-w-0 flex-1 truncate rounded-md border border-white/10 bg-background/60 px-3 py-2 font-mono text-sm">
            {link}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={copy} className="flex-1 sm:flex-none">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button asChild className="flex-1 sm:flex-none">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={share} aria-label="Share invite link">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{joinedCount}</span>{" "}
              {joinedCount === 1 ? "rider" : "riders"} joined
            </span>
            <span>
              {nextBadge
                ? `${joinedCount}/${nextBadge.threshold} to ${nextBadge.label}`
                : "All invite badges earned"}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${nextBadge ? Math.min((joinedCount / nextBadge.threshold) * 100, 100) : 100}%` }}
            />
          </div>
          {summary.recent.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Recently joined:{" "}
              {summary.recent.map((rider, i) => (
                <span key={rider.username}>
                  {i > 0 ? ", " : null}
                  <Link href={`/riders/${rider.username}`} className="text-foreground hover:text-primary">
                    {rider.fullName}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
