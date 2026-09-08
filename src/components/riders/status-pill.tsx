import { cn } from "@/lib/utils";
import type { RiderStatus } from "@/features/riders/types";

const STYLES: Record<RiderStatus, { label: string; dot: string; text: string }> = {
  online: { label: "Online", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  riding: { label: "Riding now", dot: "bg-sky-500 animate-pulse", text: "text-sky-600 dark:text-sky-400" },
  offline: { label: "Offline", dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
};

export function StatusPill({ status }: { status: RiderStatus }) {
  const style = STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", style.text)}>
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
