import { LogOut } from "lucide-react";

import { signOutAction } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { SessionUser } from "@/features/auth/types";

export function UserMenu({ user }: { user: SessionUser }) {
  const initials = (user.riderProfile?.fullName ?? user.username)
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-8">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="hidden text-sm sm:block">
        <p className="font-medium leading-none">
          {user.riderProfile?.fullName ?? user.username}
        </p>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </div>
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}
