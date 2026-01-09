export type UserType = {
  id?: string | number;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
};

export type MessageType = {
  id?: string | number;
  _id?: string;
  content?: string;
  image?: string;
  localImagePreview?: string;
  localImageFile?: File;
  errorMessage?: string;
  sender: UserType;
  replyTo?: MessageType;
  chatId?: string;
  createdAt: string;
  updatedAt: string;
  status?: "sending" | "sent" | "failed";
  isRecalled?: boolean;
};

export type ChatType = {
  id?: string | number;
  _id?: string;
  lastMessage?: MessageType;
  participants: UserType[];
  isGroup?: boolean;
  createdBy?: string;
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
  imageFile?: File;
  localImagePreview?: string;
  replyToId?: string;
  postId?: string | number;
};

// API Response Types
export type ApiResponse<T> = {
  code: string;
  message: string;
  data: T | null;
};

export type CreateConversationResponse = ApiResponse<ChatType>;
export type SendMessageResponse = ApiResponse<MessageType>;

export type ConversationRow = {
  id: number | string;
  user_one_id: number | string;
  user_two_id: number | string;
  last_message_id: number | string | null;
  updated_at: string;
};
