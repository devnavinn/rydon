"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/users", label: "Users" },
];

export function AdminTabs({ openReports }: { openReports: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-white/8">
      {TABS.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              active && "border-primary text-foreground"
            )}
          >
            {label}
            {href === "/admin/reports" && openReports > 0 ? (
              <span className="rounded-full bg-destructive/20 px-1.5 text-xs text-destructive">{openReports}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
