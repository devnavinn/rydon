"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { publicRidePath } from "@/features/rides/format";
import { Button } from "@/components/ui/button";

/** Shares the ride's public page — native share sheet on mobile, copy-link elsewhere. */
export function ShareRideButton({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}${publicRidePath(slug)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Ride with us on Rydo: ${title}`, url });
        return;
      } catch (error) {
        // User closed the share sheet — nothing to do.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick}>
      {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}
