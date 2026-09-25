import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { Nav, MobileTabBar } from "@/components/shared/nav";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationBell } from "@/components/shared/notification-bell";
import { VerifyEmailBanner } from "@/components/shared/verify-email-banner";
import { LocationAutoSync } from "@/components/shared/location-auto-sync";

// Signed-in app pages are personal — keep them out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.riderProfile?.profileCompleted) redirect("/onboarding");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <LocationAutoSync />
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 overflow-x-hidden border-b border-white/8 bg-background/85 px-4 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_1px_oklch(1_0_0/8%)]">
              <svg viewBox="0 0 24 24" fill="none" className="size-4.5">
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
