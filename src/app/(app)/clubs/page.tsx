import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { discoverClubs, listMyClubs } from "@/features/clubs/server/queries";
import { ClubCard } from "@/components/clubs/club-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ClubsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const query = (await searchParams).q?.trim().slice(0, 80) ?? "";
  const [mine, discover] = await Promise.all([
    listMyClubs(user.id),
    discoverClubs({ userId: user.id, city: user.riderProfile?.city ?? null, query }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-wide">Clubs</h1>
          <p className="text-sm text-muted-foreground">Your riding crews — members, rides, and invites in one place.</p>
        </div>
        <Button asChild>
          <Link href="/clubs/new">
            <Plus className="size-4" /> Start a club
          </Link>
        </Button>
      </div>

      {mine.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Your clubs</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {mine.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                tag={
                  club.membership.status === "PENDING"
                    ? "Requested"
                    : club.membership.role === "MEMBER"
                      ? undefined
                      : club.membership.role === "OWNER"
                        ? "Owner"
                        : "Admin"
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium">{query ? `Clubs matching "${query}"` : "Discover clubs"}</h2>
          <form action="/clubs" className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={query} placeholder="Search by name or city" className="pl-8" />
          </form>
        </div>
        {discover.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {discover.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
            {query ? "No clubs match that." : "No clubs to discover yet."} Run a riding club?{" "}
            <Link href="/clubs/new" className="text-primary hover:underline">
              Bring it to Rydo
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
