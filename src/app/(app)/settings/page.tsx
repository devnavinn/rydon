import { requireUser } from "@/lib/auth";
import { getOwnProfileDetail } from "@/features/profile/server/queries";
import { listBlockedUsers } from "@/features/blocking/server/queries";
import { ProfileForm } from "@/components/settings/profile-form";
import { BikesSection } from "@/components/settings/bikes-section";
import { EmergencyContactsSection } from "@/components/settings/emergency-contacts-section";
import { EmergencySharingCard } from "@/components/settings/emergency-sharing-card";
import { BlockedRidersSection } from "@/components/settings/blocked-riders-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await requireUser();
  const [{ profile, bikes, emergencyContacts }, blockedUsers] = await Promise.all([
    getOwnProfileDetail(user.id),
    listBlockedUsers(user.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your rider profile and safety info.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rider profile</CardTitle>
          <CardDescription>How the brotherhood sees you.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={{
              fullName: profile.fullName,
              bio: profile.bio,
              city: profile.city,
              state: profile.state,
              country: profile.country,
              ridingStyle: profile.ridingStyle,
              preferredRadiusKm: profile.preferredRadiusKm,
              yearsRiding: profile.yearsRiding,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bikes</CardTitle>
          <CardDescription>Your garage.</CardDescription>
        </CardHeader>
        <CardContent>
          <BikesSection bikes={bikes} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency contacts</CardTitle>
          <CardDescription>Who to notify if something goes wrong on a ride.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <EmergencySharingCard emergencySharingOn={profile.emergencySharingOn} />
          <div className="border-t border-white/8 pt-4">
            <EmergencyContactsSection contacts={emergencyContacts} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked riders</CardTitle>
          <CardDescription>
            Manage who you&apos;ve blocked from discovery and shared rides.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlockedRidersSection initialData={blockedUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
