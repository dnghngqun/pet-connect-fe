export type UserType = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
};

export type MessageType = {
  _id: string;
  content?: string;
  image?: string;
  sender: UserType;
  replyTo?: MessageType;
  chatId: string;
  createdAt: string;
  updatedAt: string;
  status?: "sending" | "sent" | "failed";
};

export type ChatType = {
  _id: string;
  lastMessage?: MessageType;
  participants: UserType[];
  isGroup: boolean;
  createdBy: string;
  groupName?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateChatPayload = {
  participantId?: string;
  isGroup?: boolean;
  participants?: string[];
  groupName?: string;
};

export type CreateMessagePayload = {
  chatId: string;
  content?: string;
  image?: string;
  replyToId?: string;
};
