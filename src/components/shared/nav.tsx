"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Map,
  Route,
  PlusCircle,
  User,
  Settings,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/riders", label: "Riders", icon: Users },
  { href: "/map", label: "Map", icon: Map },
  { href: "/rides", label: "Rides", icon: Route },
  { href: "/saved-rides", label: "Saved", icon: Bookmark },
  { href: "/rides/create", label: "Create Ride", icon: PlusCircle },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

const PRIMARY_LINKS = LINKS.filter((link) =>
  ["/dashboard", "/riders", "/map", "/rides", "/rides/create"].includes(link.href)
);
const OVERFLOW_LINKS = LINKS.filter((link) => !PRIMARY_LINKS.includes(link));

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

export function Nav() {
  const pathname = usePathname();
  const overflowActive = OVERFLOW_LINKS.some((link) => isActive(pathname, link.href));

  return (
    <nav className="hidden min-w-0 items-center gap-0.5 rounded-full border border-white/8 bg-white/[0.03] p-1 md:flex">
      {PRIMARY_LINKS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
              active && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="hidden lg:inline">{label}</span>
          </Link>
        );
      })}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
              overflowActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            )}
            aria-label="More"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {OVERFLOW_LINKS.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} className={cn(isActive(pathname, href) && "text-primary")}>
                <Icon className="size-4" />
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

const TAB_LINKS = LINKS.filter((link) => link.href !== "/profile" && link.href !== "/settings");

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-white/8 bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TAB_LINKS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors"
          >
            {active ? (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
            ) : null}
            <Icon className={cn("size-5 transition-colors", active && "text-primary")} />
            <span className={cn(active && "text-foreground")}>
              {label === "Create Ride" ? "Create" : label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
