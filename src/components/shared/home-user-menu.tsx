"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";

import { signOutAction } from "@/features/auth/server/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SessionUser } from "@/features/auth/types";

export function HomeUserMenu({ user }: { user: SessionUser }) {
  const displayName = user.riderProfile?.fullName ?? user.username;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Avatar className="size-8">
          {user.riderProfile?.avatarUrl && (
            <AvatarImage src={user.riderProfile.avatarUrl} alt={displayName} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:block">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="font-medium leading-none">{displayName}</p>
          <p className="mt-1 text-xs font-normal text-muted-foreground">@{user.username}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => signOutAction()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
