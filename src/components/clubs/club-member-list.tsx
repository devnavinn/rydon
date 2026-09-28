import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { ClubRole } from "@prisma/client";

import {
  approveMemberAction,
  removeMemberAction,
  setMemberRoleAction,
} from "@/features/clubs/server/actions";
import { canManageMember } from "@/features/clubs/permissions";
import type { ClubMemberDTO } from "@/features/clubs/types";
import { ActionButton } from "@/components/shared/action-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MemberIdentity({ member, detail }: { member: ClubMemberDTO; detail: string }) {
  return (
    <Link href={`/riders/${member.username}`} className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar className="size-9">
        <AvatarFallback>{initials(member.fullName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{member.fullName}</p>
          {member.role !== "MEMBER" ? (
            <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
              {member.role === "OWNER" ? "Owner" : "Admin"}
            </Badge>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          @{member.username}
          {detail ? ` · ${detail}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function PendingRequestList({ clubId, pending }: { clubId: string; pending: ClubMemberDTO[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {pending.map((member) => (
        <li key={member.userId} className="flex flex-wrap items-center gap-2">
          <MemberIdentity
            member={member}
            detail={`asked ${formatDistanceToNow(new Date(member.requestedAt), { addSuffix: true })}`}
          />
          <div className="flex gap-1.5">
            <ActionButton
              action={approveMemberAction.bind(null, clubId, member.userId)}
              label="Approve"
              pendingLabel="Approving…"
              variant="default"
            />
            <ActionButton
              action={removeMemberAction.bind(null, clubId, member.userId)}
              label="Decline"
              pendingLabel="Declining…"
              variant="ghost"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ClubMemberList({
  clubId,
  members,
  viewerId,
  viewerRole,
}: {
  clubId: string;
  members: ClubMemberDTO[];
  viewerId: string;
  /** Null when the viewer isn't an admin — the list is read-only. */
  viewerRole: ClubRole | null;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {members.map((member) => {
        const manageable = viewerRole !== null && member.userId !== viewerId && canManageMember(viewerRole, member.role);
        return (
          <li key={member.userId} className="flex flex-wrap items-center gap-2">
            <MemberIdentity member={member} detail={member.city ?? ""} />
            {manageable ? (
              <div className="flex flex-wrap gap-1">
                {viewerRole === "OWNER" ? (
                  <>
                    <ActionButton
                      action={setMemberRoleAction.bind(null, clubId, member.userId, member.role === "ADMIN" ? "MEMBER" : "ADMIN")}
                      label={member.role === "ADMIN" ? "Remove admin" : "Make admin"}
                      pendingLabel="Saving…"
                      variant="ghost"
                      size="xs"
                    />
                    {member.role === "ADMIN" ? (
                      <ActionButton
                        action={setMemberRoleAction.bind(null, clubId, member.userId, "OWNER")}
                        label="Make owner"
                        pendingLabel="Saving…"
                        variant="ghost"
                        size="xs"
                        confirmMessage={`Hand ownership to @${member.username}? You'll become an admin.`}
                      />
                    ) : null}
                  </>
                ) : null}
                <ActionButton
                  action={removeMemberAction.bind(null, clubId, member.userId)}
                  label="Remove"
                  pendingLabel="Removing…"
                  variant="ghost"
                  size="xs"
                  confirmMessage={`Remove @${member.username} from the club?`}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
