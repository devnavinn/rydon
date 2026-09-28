import { REFERRAL_ALPHABET } from "@/features/referrals/constants";

export const CLUB_INVITE_COOKIE = "rydo_club_invite";
export const CLUB_INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Same read-aloud-safe alphabet as rider referral codes, but longer so the two never collide in shape.
export const CLUB_INVITE_ALPHABET = REFERRAL_ALPHABET;
export const CLUB_INVITE_CODE_LENGTH = 10;
const CLUB_INVITE_CODE_PATTERN = /^[a-hjkmnp-z2-9]{10}$/;

export function isClubInviteCode(value: unknown): value is string {
  return typeof value === "string" && CLUB_INVITE_CODE_PATTERN.test(value);
}

export function clubInvitePath(code: string) {
  return `/clubs/join/${code}`;
}

export function clubPath(slug: string) {
  return `/clubs/${slug}`;
}

export function publicClubPath(slug: string) {
  return `/c/${slug}`;
}

export const JOIN_POLICY_LABELS = {
  OPEN: "Open — anyone can join",
  APPROVAL: "Approval — admins approve requests",
  INVITE_ONLY: "Invite only — hidden, join by invite link",
} as const;

export const JOIN_POLICY_SHORT = {
  OPEN: "Open",
  APPROVAL: "Approval needed",
  INVITE_ONLY: "Invite only",
} as const;
