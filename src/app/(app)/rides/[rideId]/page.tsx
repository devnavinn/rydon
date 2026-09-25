import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getRideDetail } from "@/features/rides/server/queries";
import { getEmergencySharingOn } from "@/features/profile/server/queries";
import { getOrCreateReferralCode } from "@/features/referrals/server/referrals";
import { RideRoom } from "@/components/rides/ride-room";

export default async function RideRoomPage({
  params,
}: {
  params: Promise<{ rideId: string }>;
}) {
  const { rideId } = await params;
  const [user, ride] = await Promise.all([getCurrentUser(), getRideDetail(rideId)]);

  if (!ride || !user) notFound();

  const [emergencySharingOn, referralCode] = await Promise.all([
    getEmergencySharingOn(user.id),
    getOrCreateReferralCode(user.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4">
      <RideRoom
        rideId={rideId}
        initialRide={ride}
        currentUserId={user.id}
        emergencySharingOn={emergencySharingOn}
        referralCode={referralCode}
      />
    </div>
  );
}
