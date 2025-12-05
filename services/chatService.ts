import apiClient from "@/common/apiClient";
import type {
  ChatType,
  CreateChatPayload,
  CreateMessagePayload,
  MessageType,
  UserType,
} from "@/lib/chat.types";

export const chatAPI = {
  // Chats
  getAllChats: async () => {
    const response = await apiClient.get("/chat/all");
    return response.data.chats as ChatType[];
  },

  getSingleChat: async (chatId: string) => {
    const response = await apiClient.get(`/chat/${chatId}`);
    return {
      chat: response.data.chat as ChatType,
      messages: response.data.messages as MessageType[],
    };
  },

  createChat: async (payload: CreateChatPayload) => {
    const response = await apiClient.post("/chat/create", payload);
    return response.data.chat as ChatType;
  },

  // Messages
  sendMessage: async (payload: CreateMessagePayload) => {
    const response = await apiClient.post("/chat/message/send", payload);
    return response.data.userMessage as MessageType;
  },

  // Users
  getAllUsers: async () => {
    const response = await apiClient.get("/user/all");
    return response.data.users as UserType[];
  },
};
