import Link from "next/link";
import { Users, Map, PlusCircle, Route } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const QUICK_LINKS = [
  { href: "/riders", label: "Find nearby riders", icon: Users },
  { href: "/map", label: "Open the live map", icon: Map },
  { href: "/rides/create", label: "Create a ride", icon: PlusCircle },
  { href: "/rides", label: "Browse rides", icon: Route },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const myRides = await prisma.rideMember.findMany({
    where: { userId: user.id, status: { in: ["JOINED", "REQUESTED"] } },
    select: {
      status: true,
      ride: {
        select: { id: true, title: true, style: true, status: true, rideDate: true },
      },
    },
    orderBy: { ride: { rideDate: "asc" } },
    take: 6,
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">
          Ride on, {user.riderProfile?.fullName ?? user.username}
        </h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening around you.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="group h-full border-white/8 transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <CardContent className="flex flex-col items-center gap-3 py-7 text-center">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <p className="mb-2 font-heading text-lg tracking-wide text-muted-foreground">Your rides</p>
        {myRides.length > 0 ? (
          <div className="flex flex-col gap-2">
            {myRides.map(({ ride, status }) => (
              <Link key={ride.id} href={`/rides/${ride.id}`}>
                <Card className="transition-colors hover:bg-muted/40">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ride.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ride.rideDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{ride.style}</Badge>
                      <Badge variant={status === "REQUESTED" ? "secondary" : "default"}>
                        {status === "REQUESTED" ? "Requested" : ride.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t joined a ride yet — find riders nearby or create your own.
          </p>
        )}
      </div>
    </div>
  );
}
