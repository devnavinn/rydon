import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { Nav, MobileTabBar } from "@/components/shared/nav";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationBell } from "@/components/shared/notification-bell";
import { VerifyEmailBanner } from "@/components/shared/verify-email-banner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.riderProfile?.profileCompleted) redirect("/onboarding");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 overflow-x-hidden border-b border-white/5 bg-background/85 px-4 py-3 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" fill="none" className="size-4">
                <path d="M4 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z" stroke="currentColor" strokeWidth="2" />
                <path d="M13 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M7.5 17.5 10 9h3l1.2 2.4M10 9 8.5 6h-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M13 9h3.5l1 2.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-heading text-xl tracking-wide">RYDO</span>
          </Link>
          <Nav />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <NotificationBell />
          <UserMenu user={user} />
        </div>
      </header>
      {!user.isVerified ? <VerifyEmailBanner /> : null}
      <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>
      <MobileTabBar />
    </div>
  );
}
