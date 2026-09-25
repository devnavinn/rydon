import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HomeUserMenu } from "@/components/shared/home-user-menu";
import { getCurrentUser } from "@/lib/auth";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" fill="none" className="size-4.5">
                <path
                  d="M4 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M13 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7.5 17.5 10 9h3l1.2 2.4M10 9 8.5 6h-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 9h3.5l1 2.4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-heading text-2xl tracking-wide">RYDO</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium sm:flex">
            <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="/safety" className="text-muted-foreground transition-colors hover:text-foreground">
              Safety
            </Link>
            {!user && (
              <Link href="/sign-in" className="text-muted-foreground transition-colors hover:text-foreground">
                Sign in
              </Link>
            )}
          </nav>
          {user ? (
            <HomeUserMenu user={user} />
          ) : (
            <Button asChild size="sm" className="font-medium">
              <Link href="/sign-up">Join Rydo</Link>
            </Button>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <span className="font-heading text-lg tracking-wide text-foreground/80">RYDO</span>
          <p>&copy; {new Date().getFullYear()} Rydo. Ride together, ride safe.</p>
          <div className="flex gap-5">
            <Link href="/cities" className="hover:text-foreground">Cities</Link>
            <Link href="/routes" className="hover:text-foreground">Routes</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/safety" className="hover:text-foreground">Safety</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
