import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { signOutAction } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Account suspended",
  robots: { index: false, follow: false },
};

export default function AccountSuspendedPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
      <ShieldAlert className="size-10 text-destructive" />
      <h1 className="font-heading text-2xl tracking-wide">Account suspended</h1>
      <p className="text-sm text-muted-foreground">
        This account has been suspended by the Rydo moderation team. If you think this is a
        mistake, reply to any Rydo email to reach us.
      </p>
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
}
