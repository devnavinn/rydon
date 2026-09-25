export type ReferralSummary = {
  code: string;
  /** Riders who finished onboarding through this rider's invite. */
  joinedCount: number;
  nextBadge: { label: string; threshold: number } | null;
  recent: { username: string; fullName: string }[];
};
