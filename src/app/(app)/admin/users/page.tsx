import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";

import { requireStaff } from "@/lib/auth";
import { isAdmin, isStaff } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { listUsers } from "@/features/admin/server/queries";
import { Pagination } from "@/components/admin/pagination";
import { RoleSelect } from "@/components/admin/role-select";
import { SuspendToggle } from "@/components/admin/suspend-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "suspended", label: "Suspended" },
  { value: "staff", label: "Staff" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 100) ?? "";
  const filter: Filter = FILTERS.some((f) => f.value === params.filter) ? (params.filter as Filter) : "all";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const viewer = await requireStaff();
  const { users, total, pageCount } = await listUsers({ query, filter, page });
  const viewerIsAdmin = isAdmin(viewer.role);

  return (
    <div className="flex flex-col gap-4">
      <form action="/admin/users" className="flex gap-2">
        <input type="hidden" name="filter" value={filter} />
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={query} placeholder="Search username, email, or name" className="pl-8" />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/users?${new URLSearchParams({ filter: f.value, ...(query ? { q: query } : {}) })}`}
            className={cn(
              "rounded-full border border-white/8 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
              f.value === filter && "border-primary bg-primary/10 text-primary"
            )}
          >
            {f.label}
          </Link>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{total} riders</span>
      </div>

      {users.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No riders match.</p>
      ) : (
        <ul className="divide-y divide-white/8 overflow-hidden rounded-xl border border-white/8">
          {users.map((user) => {
            const isSelf = user.id === viewer.id;
            // Mirrors the server-side checks in the actions; hiding controls here is just UX.
            const canModerate = !isSelf && (viewerIsAdmin || !isStaff(user.role));
            return (
              <li key={user.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/riders/${user.username}`} className="truncate text-sm font-medium hover:underline">
                      {user.fullName}
                    </Link>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                    {user.role !== "USER" ? <Badge>{user.role}</Badge> : null}
                    {!user.isActive ? <Badge variant="destructive">Suspended</Badge> : null}
                    {user.reportsAgainst > 0 ? (
                      <Badge variant="outline" className="text-destructive">
                        {user.reportsAgainst} {user.reportsAgainst === 1 ? "report" : "reports"}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email ?? "no email"}
                    {user.isVerified ? " (verified)" : ""} · joined{" "}
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    {user.lastSeenAt
                      ? ` · seen ${formatDistanceToNow(new Date(user.lastSeenAt), { addSuffix: true })}`
                      : ""}
                  </p>
                </div>
                {canModerate ? (
                  <div className="flex items-start gap-2">
                    {viewerIsAdmin ? <RoleSelect userId={user.id} role={user.role} /> : null}
                    <SuspendToggle userId={user.id} username={user.username} isActive={user.isActive} />
                  </div>
                ) : isSelf ? (
                  <span className="text-xs text-muted-foreground">You</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/admin/users"
        params={{ filter, ...(query ? { q: query } : {}) }}
      />
    </div>
  );
}
