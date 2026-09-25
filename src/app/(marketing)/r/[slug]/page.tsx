import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Calendar, Clock, Gauge, HardHat, MapPin, Timer, Users, UserPlus, ShieldCheck } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getAppUrl } from "@/lib/app-url";
import { haversineDistanceKm } from "@/lib/geo";
import { getPublicRide } from "@/features/rides/server/queries";
import { formatRideDay, formatRideStyle, formatRideTime, publicRidePath } from "@/features/rides/format";
import type { PublicRide } from "@/features/rides/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapView } from "@/components/map/map-view";

// generateMetadata and the page both need the ride — dedupe to one query.
const loadRide = cache(getPublicRide);

type Props = { params: Promise<{ slug: string }> };

function isEnded(ride: PublicRide) {
  return ride.status === "COMPLETED" || ride.status === "CANCELLED";
}

function summary(ride: PublicRide) {
  return `${formatRideStyle(ride.style)} ride from ${ride.startLocationName} to ${ride.destinationName} on ${formatRideDay(ride.rideDate)}, meetup ${formatRideTime(ride.meetupTime)}. ${ride.memberCount}/${ride.maxRiders} riders going.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ride = await loadRide(slug);

  if (!ride || ride.visibility !== "PUBLIC") {
    return { title: "Ride", robots: { index: false, follow: false } };
  }

  const description = summary(ride);
  const url = publicRidePath(ride.slug);

  return {
    title: ride.title,
    description,
    alternates: { canonical: url },
    robots: isEnded(ride) ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", siteName: "Rydo", title: ride.title, description, url },
    twitter: { card: "summary_large_image", title: ride.title, description },
  };
}

/** schema.org Event, so search engines can show the ride as an event. */
function rideJsonLd(ride: PublicRide, url: string) {
  const place = (name: string, lat: number, lng: number) => ({
    "@type": "Place",
    name,
    address: name,
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
  });
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ride.title,
    description: ride.description ?? summary(ride),
    url,
    startDate: ride.meetupTime.toISOString(),
    ...(ride.estimatedDurationMin
      ? { endDate: new Date(ride.meetupTime.getTime() + ride.estimatedDurationMin * 60_000).toISOString() }
      : {}),
    eventStatus:
      ride.status === "CANCELLED" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: place(ride.startLocationName, ride.startLatitude, ride.startLongitude),
    organizer: { "@type": "Person", name: ride.host.fullName },
    maximumAttendeeCapacity: ride.maxRiders,
    remainingAttendeeCapacity: Math.max(ride.maxRiders - ride.memberCount, 0),
    isAccessibleForFree: true,
  };
}

function zoomForDistance(km: number) {
  if (km < 5) return 12;
  if (km < 20) return 11;
  if (km < 60) return 9;
  if (km < 150) return 8;
  return 7;
}

export default async function PublicRidePage({ params }: Props) {
  const { slug } = await params;
  const [ride, user] = await Promise.all([loadRide(slug), getCurrentUser()]);

  if (!ride) notFound();

  const roomPath = `/rides/${ride.id}`;

  // Signed-in riders get the full ride room (join, chat, live tracking).
  if (user) redirect(roomPath);

  if (ride.visibility !== "PUBLIC") {
    redirect(`/sign-in?next=${encodeURIComponent(roomPath)}`);
  }

  // Old `/rides/<id>` links land here by id — settle on the slug URL.
  if (slug !== ride.slug) redirect(publicRidePath(ride.slug));

  const start = { lat: ride.startLatitude, lng: ride.startLongitude };
  const destination = { lat: ride.destinationLatitude, lng: ride.destinationLongitude };
  const straightKm = haversineDistanceKm(start, destination);
  const spotsLeft = Math.max(ride.maxRiders - ride.memberCount, 0);
  const ended = isEnded(ride);
  const next = encodeURIComponent(roomPath);
  const hostInitials = ride.host.fullName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const facts = [
    { icon: Calendar, label: formatRideDay(ride.rideDate) },
    { icon: Clock, label: `Meetup ${formatRideTime(ride.meetupTime)}` },
    ride.estimatedDistanceKm ? { icon: Gauge, label: `${ride.estimatedDistanceKm} km` } : null,
    ride.estimatedDurationMin
      ? {
          icon: Timer,
          label:
            ride.estimatedDurationMin >= 60
              ? `${Math.floor(ride.estimatedDurationMin / 60)}h ${ride.estimatedDurationMin % 60}m`
              : `${ride.estimatedDurationMin} min`,
        }
      : null,
    { icon: Users, label: `${ride.memberCount}/${ride.maxRiders} riders` },
  ].filter((fact) => fact !== null);

  const rules = [
    ride.helmetRequired ? { icon: HardHat, label: "Helmet required" } : null,
    ride.allowPillion ? { icon: UserPlus, label: "Pillion welcome" } : null,
    ride.requiresApproval ? { icon: ShieldCheck, label: "Host approves riders" } : null,
  ].filter((rule) => rule !== null);

  let cta: React.ReactNode;
  if (ended) {
    cta = (
      <>
        <p className="text-sm text-muted-foreground">
          {ride.status === "CANCELLED" ? "This ride was cancelled." : "This ride has wrapped up."} Plenty more
          are rolling out near you.
        </p>
        <Button asChild className="w-full">
          <Link href="/sign-up">Find rides near you</Link>
        </Button>
      </>
    );
  } else if (spotsLeft === 0 || ride.status === "FULL") {
    cta = (
      <>
        <p className="text-sm text-muted-foreground">
          This ride is full. Join Rydo to save it and catch the next one from {ride.host.fullName}.
        </p>
        <Button asChild className="w-full">
          <Link href={`/sign-up?next=${next}`}>Join Rydo</Link>
        </Button>
      </>
    );
  } else {
    cta = (
      <>
        <p className="text-sm">
          <span className="font-heading text-2xl tracking-wide text-primary">{spotsLeft}</span>{" "}
          <span className="text-muted-foreground">{spotsLeft === 1 ? "spot" : "spots"} left</span>
        </p>
        <Button asChild size="lg" className="w-full">
          <Link href={`/sign-up?next=${next}`}>
            {ride.requiresApproval ? "Request to join" : "Join this ride"}
          </Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Already on Rydo?{" "}
          <Link href={`/sign-in?next=${next}`} className="font-medium text-foreground underline">
            Sign in
          </Link>
        </p>
      </>
    );
  }

  const url = `${await getAppUrl()}${publicRidePath(ride.slug)}`;
  // `<` is escaped so ride text can't close the script tag.
  const jsonLd = JSON.stringify(rideJsonLd(ride, url)).replace(/</g, "\\u003c");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{formatRideStyle(ride.style)}</Badge>
          {ride.status === "ONGOING" ? <Badge>Riding now</Badge> : null}
          {ended ? <Badge variant="secondary">{formatRideStyle(ride.status)}</Badge> : null}
        </div>
        <h1 className="font-heading text-4xl tracking-wide sm:text-5xl">{ride.title}</h1>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span>
            {ride.startLocationName} → {ride.destinationName}
          </span>
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {facts.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <Icon className="size-4" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border" style={{ height: 320 }}>
            <MapView
              center={[(start.lat + destination.lat) / 2, (start.lng + destination.lng) / 2]}
              zoom={zoomForDistance(straightKm)}
              markers={[
                { id: "start", lat: start.lat, lng: start.lng, kind: "start", label: ride.startLocationName },
                {
                  id: "destination",
                  lat: destination.lat,
                  lng: destination.lng,
                  kind: "destination",
                  label: ride.destinationName,
                },
              ]}
            />
          </div>

          {ride.description ? (
            <section className="flex flex-col gap-2">
              <h2 className="font-heading text-xl tracking-wide">About this ride</h2>
              <p className="text-sm whitespace-pre-line text-muted-foreground">{ride.description}</p>
            </section>
          ) : null}

          {rules.length > 0 ? (
            <section className="flex flex-wrap gap-2">
              {rules.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground"
                >
                  <Icon className="size-3.5" />
                  {label}
                </span>
              ))}
            </section>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="flex flex-col gap-3">{cta}</CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback>{hostInitials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Hosted by</p>
                <p className="truncate font-medium">{ride.host.fullName}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
