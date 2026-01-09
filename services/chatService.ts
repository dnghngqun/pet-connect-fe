import apiClient from "@/common/apiClient";
import type {
  ChatType,
  CreateChatPayload,
  CreateMessagePayload,
  MessageType,
  UserType,
  ApiResponse,
} from "@/lib/chat.types";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BASE_URL } from "@/common/Constant/COMMON_API";

let stompClient: Client | null = null;
let isConnected = false;

export const chatAPI = {

  getAllChats: async () => {

    const response = await apiClient.get("/api/conversation/all");
    const apiResponse = response.data as ApiResponse<any[]>;
    
    if (!apiResponse.data) return [];
    

    const normalizedChats = apiResponse.data.map((chat: any) => normalizeChatResponse(chat));
    

    const uniqueChats = normalizedChats.filter((chat, index, self) => 
      index === self.findIndex(c => c._id === chat._id)
    );
    
    return uniqueChats;
  },

  getSingleChat: async (chatId: string) => {

    const response = await apiClient.get(`/api/conversation/${chatId}`);

    const data = response.data.data || response.data;
    const rawMessages = data.messages;

    let messages: MessageType[] = [];
    let pagination: any =
      data.pagination ?? rawMessages?.pagination ?? null;

    if (Array.isArray(rawMessages)) {

      messages = rawMessages.map((msg: any) => normalizeMessageResponse(msg));
    } else if (rawMessages && rawMessages.items) {
      messages = rawMessages.items.map((msg: any) => normalizeMessageResponse(msg));
    }
    messages.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });

    return {
      chat: data.chat as ChatType,
      messages,
      pagination,
    };
  },

  createChat: async (payload: CreateChatPayload): Promise<ChatType> => {

    const backendPayload = {
      targetUserId: payload.participantId ? Number(payload.participantId) : undefined,
    };
    
    const response = await apiClient.post("/api/conversation/create", backendPayload);
    const apiResponse = response.data as ApiResponse<ChatType>;
    if (apiResponse.code !== "0000") {
      throw new Error(apiResponse.message || "Failed to create conversation");
    }

    if (!apiResponse.data) {
      throw new Error("No conversation data returned");
    }
    return normalizeChatResponse(apiResponse.data);
  },
  sendMessage: async (payload: CreateMessagePayload): Promise<MessageType | null> => {

    const backendPayload = {
      conversationId: payload.chatId ? Number(payload.chatId) : undefined,
      content: payload.content,
      image: payload.image,
      replyToId: payload.replyToId ? Number(payload.replyToId) : undefined,
      postId: payload.postId ? Number(payload.postId) : undefined,
    };
    if (stompClient && isConnected) {
      const message = {
        conversationId: backendPayload.conversationId,
        content: backendPayload.content,
        image: backendPayload.image,
        replyToId: backendPayload.replyToId,
        postId: backendPayload.postId,
        type: payload.image ? "IMAGE" : "TEXT",
        timestamp: new Date().toISOString(),
      };

      stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(message),
      });
      return null;
    }
    if (!backendPayload.conversationId || isNaN(backendPayload.conversationId)) {
        throw new Error("Invalid Conversation ID: " + payload.chatId);
    }

    const response = await apiClient.post("/api/conversation/message/send", backendPayload);
    const apiResponse = response.data as ApiResponse<MessageType>;
    if (apiResponse.code !== "0000") {
      throw new Error(apiResponse.message || "Failed to send message");
    }

    if (!apiResponse.data) {
      throw new Error("No message data returned");
    }
    return normalizeMessageResponse(apiResponse.data);
  },
  connectWebSocket: (
    token: string,
    onMessage?: (message: any) => void,
    onNotification?: (notification: any) => void,
    onError?: (error: any) => void
  ) => {

    if (onMessage) chatAPI.addMessageListener(onMessage);
    if (onNotification) chatAPI.addNotificationListener(onNotification);

    if (stompClient?.active) return;

    const socket = new SockJS(`${BASE_URL}/ws`);
    stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: (frame) => {
        console.log("Connected to WebSocket:", frame);
        isConnected = true;
        stompClient?.subscribe("/user/queue/messages", (message: IMessage) => {
          const response = JSON.parse(message.body);
          console.log("WebSocket message received:", response);

          messageListeners.forEach(listener => listener(response));
        });
        stompClient?.subscribe(
          "/user/queue/notifications",
          (notification: IMessage) => {
            const response = JSON.parse(notification.body);
            notificationListeners.forEach(listener => listener(response));
          }
        );
        stompClient?.subscribe("/user/queue/errors", (error: IMessage) => {
          const response = JSON.parse(error.body);
          if (onError) onError(response);
          console.error("WebSocket Error:", response);
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
        isConnected = false;
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        console.log("WebSocket connection closed");
        isConnected = false;
        stompClient = null;
      },
    });

    stompClient.activate();
  },

  disconnectWebSocket: () => {
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
      isConnected = false;
      messageListeners = [];
      notificationListeners = [];
    }
  },
  addMessageListener: (listener: (message: any) => void) => {
    messageListeners.push(listener);
    return () => {
      messageListeners = messageListeners.filter(l => l !== listener);
    };
  },

  addNotificationListener: (listener: (notification: any) => void) => {
    notificationListeners.push(listener);
    return () => {
      notificationListeners = notificationListeners.filter(l => l !== listener);
    };
  },
  getAllUsers: async () => {
    const response = await apiClient.get("/api/mobile/users", {
      params: { limit: 200 },
    });
    const payload = response.data?.data || response.data || [];
    const users = Array.isArray(payload) ? payload : payload.users || [];
    
    return users.map((u: any) => ({
      id: u.id,
      _id: String(u.id),
      name: u.fullName || u.name || '',
      email: u.email || '',
      avatar: u.avatarUrl || u.avatar || null,
    })) as UserType[];
  },
  recallMessage: async (messageId: string): Promise<MessageType> => {
    const response = await apiClient.put(`/api/conversation/message/${messageId}/recall`);
    const apiResponse = response.data as ApiResponse<MessageType>;

    if (apiResponse.code !== "0000") {
      throw new Error(apiResponse.message || "Failed to recall message");
    }

    if (!apiResponse.data) {
      throw new Error("No message data returned");
    }

    return normalizeMessageResponse(apiResponse.data);
  },
  deleteConversation: async (conversationId: string): Promise<void> => {
    const response = await apiClient.delete(`/api/conversation/${conversationId}`);
    const apiResponse = response.data as ApiResponse<void>;

    if (apiResponse.code !== "0000") {
      throw new Error(apiResponse.message || "Failed to delete conversation");
    }
  },
  uploadChatImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/api/conversation/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const apiResponse = response.data as ApiResponse<string>;

    if (apiResponse.code !== "0000") {
      throw new Error(apiResponse.message || "Failed to upload image");
    }

    return apiResponse.data || "";
  },
};
let messageListeners: ((message: any) => void)[] = [];
let notificationListeners: ((notification: any) => void)[] = [];

/**
 * Normalize chat response from backend to ChatType format
 * Backend uses 'id', frontend uses '_id'
 */
function normalizeChatResponse(data: any): ChatType {
  return {
    id: data.id,
    _id: String(data.id),
    participants: (data.participants || []).map((p: any) =>
      normalizeUserResponse(p)
    ),
    isGroup: data.isGroup || false,
    createdBy: data.createdBy || "",
    groupName: data.groupName,
    lastMessage: data.lastMessage
      ? normalizeMessageResponse(data.lastMessage)
      : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Normalize message response from backend to MessageType format
 * Backend WebSocket uses 'conversationId', REST API uses 'chatId'
 */
export function normalizeMessageResponse(data: any): MessageType {

  const chatId = data.chatId || (data.conversationId ? String(data.conversationId) : "");
  

  let replyTo: MessageType | undefined = undefined;
  if (data.replyTo) {
    replyTo = {
      _id: String(data.replyTo.id),
      content: data.replyTo.content,
      sender: normalizeUserResponse(data.replyTo.sender),
      createdAt: "",
      updatedAt: "",
    };
  }
  
  return {
    id: data.id,
    _id: String(data.id),
    content: data.content,
    image: data.image,
    sender: normalizeUserResponse(data.sender),
    replyTo,
    chatId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    status: data.status && data.status !== "sent" ? data.status : undefined,
    isRecalled: data.isRecalled || false,
  };
}

/**
 * Normalize user response from backend to UserType format
 */
function normalizeUserResponse(data: any): UserType {

  if (!data) {
    return {
      id: undefined,
      _id: "",
      name: "Unknown User",
      email: "",
      avatar: undefined,
      isOnline: false,
    };
  }
  
  return {
    id: data.id,
    _id: String(data.id || ""),
    name: data.name || "Unknown User",
    email: data.email || "",
    avatar: data.avatar,
    isOnline: data.isOnline || false,
  };
}
