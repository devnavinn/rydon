import {
  Flag,
  Repeat,
  Gauge,
  Trophy,
  Award,
  Moon,
  Coffee,
  Mountain,
  HeartHandshake,
  ShieldCheck,
  Crown,
  Users,
  Sparkles,
} from "lucide-react";

import { BADGE_BY_CODE } from "@/lib/badges";
import { Card, CardContent } from "@/components/ui/card";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Flag,
  Repeat,
  Gauge,
  Trophy,
  Award,
  Moon,
  Coffee,
  Mountain,
  HeartHandshake,
  ShieldCheck,
  Crown,
  Users,
};

export function BadgeShelf({ badges }: { badges: { code: string }[] }) {
  if (badges.length === 0) {
    return (
      <Card className="border-dashed border-white/12 bg-transparent">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            No badges yet — they&apos;re earned by completing rides.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {badges.map(({ code }) => {
        const badge = BADGE_BY_CODE.get(code);
        if (!badge) return null;
        const Icon = ICONS[badge.icon] ?? Sparkles;
        return (
          <div
            key={code}
            title={badge.description}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-card p-3 text-center transition-colors hover:border-primary/40"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <span className="text-xs font-medium">{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}
