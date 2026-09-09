export type BlockedUserDTO = {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  reason: string | null;
  createdAt: string;
};
