export const REFERRAL_COOKIE = "rydo_ref";
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Lowercase, no look-alikes (0/o, 1/l/i) so codes survive being read aloud.
export const REFERRAL_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const REFERRAL_CODE_LENGTH = 8;
export const REFERRAL_CODE_PATTERN = /^[a-hjkmnp-z2-9]{8}$/;

export function isReferralCode(value: unknown): value is string {
  return typeof value === "string" && REFERRAL_CODE_PATTERN.test(value);
}

export function referralPath(code: string) {
  return `/join/${code}`;
}
