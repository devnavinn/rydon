export type ChatMessageDTO = {
  id: string;
  groupId: string;
  senderId: string;
  senderUsername: string;
  senderFullName: string;
  senderAvatarUrl: string | null;
  body: string;
  createdAt: string;
};

export type ChatMessagesPage = {
  messages: ChatMessageDTO[];
  nextCursor: string | null;
};
