import type { ClubJoinPolicy } from "@prisma/client";

import { joinClubAction, leaveClubAction } from "@/features/clubs/server/actions";
import type { ClubViewerMembership } from "@/features/clubs/types";
import { ActionButton } from "@/components/shared/action-button";

export function ClubMembershipButton({
  clubId,
  clubName,
  joinPolicy,
  membership,
  inviteCode,
}: {
  clubId: string;
  clubName: string;
  joinPolicy: ClubJoinPolicy;
  membership: ClubViewerMembership;
  /** A valid invite code from the link they arrived on — lets them skip approval. */
  inviteCode: string | null;
}) {
  if (membership?.status === "ACTIVE") {
    if (membership.role === "OWNER") return null;
    return (
      <ActionButton
        action={leaveClubAction.bind(null, clubId)}
        label="Leave club"
        pendingLabel="Leaving…"
        variant="ghost"
        confirmMessage={`Leave ${clubName}?`}
      />
    );
  }

  if (membership?.status === "PENDING" && !inviteCode) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm text-muted-foreground">Request sent</span>
        <ActionButton
          action={leaveClubAction.bind(null, clubId)}
          label="Cancel request"
          pendingLabel="Cancelling…"
          variant="ghost"
          size="xs"
        />
      </div>
    );
  }

  const joinsNow = Boolean(inviteCode) || joinPolicy === "OPEN";
  return (
    <ActionButton
      action={joinClubAction.bind(null, clubId, inviteCode)}
      label={joinsNow ? "Join club" : "Request to join"}
      pendingLabel={joinsNow ? "Joining…" : "Sending…"}
      variant="default"
    />
  );
}
