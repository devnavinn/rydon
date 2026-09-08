import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function RiderProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      lastSeenAt: true,
      riderProfile: {
        select: {
          fullName: true,
          bio: true,
          city: true,
          state: true,
          country: true,
          ridingStyle: true,
          level: true,
          totalRides: true,
          totalDistanceKm: true,
          yearsRiding: true,
        },
      },
      bikes: { select: { brand: true, model: true, year: true, isPrimary: true } },
    },
  });

  if (!user || !user.riderProfile) notFound();

  const initials = user.riderProfile.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <Card>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl tracking-wide">{user.riderProfile.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              @{user.username}
              {user.riderProfile.city ? ` · ${user.riderProfile.city}` : ""}
            </p>
            <div className="mt-1.5 flex gap-2">
              <Badge variant="outline">{user.riderProfile.level}</Badge>
              {user.riderProfile.ridingStyle ? (
                <Badge variant="outline">{user.riderProfile.ridingStyle}</Badge>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {user.riderProfile.bio ? (
        <Card>
          <CardContent>
            <p className="text-sm">{user.riderProfile.bio}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold">{user.riderProfile.totalRides}</p>
            <p className="text-xs text-muted-foreground">Rides</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{user.riderProfile.totalDistanceKm}</p>
            <p className="text-xs text-muted-foreground">Km ridden</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{user.riderProfile.yearsRiding ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Years riding</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="mb-2 text-sm font-medium">Bikes</p>
          <div className="flex flex-col gap-1.5">
            {user.bikes.length > 0 ? (
              user.bikes.map((bike, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>
                    {bike.brand} {bike.model} {bike.year ? `(${bike.year})` : ""}
                  </span>
                  {bike.isPrimary ? <Badge variant="secondary">Primary</Badge> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No bikes listed.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
