import { cn } from "@/lib/utils";

/** Initials tile — clubs don't have uploaded logos yet. */
export function ClubAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-heading text-lg tracking-wide text-primary",
        className
      )}
    >
      {initials}
    </span>
  );
}
