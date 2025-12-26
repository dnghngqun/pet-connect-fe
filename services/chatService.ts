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
  // Chats
  getAllChats: async () => {
    // Updated endpoint to match backend 'conversation' resource
    const response = await apiClient.get("/api/conversation/all");
    const apiResponse = response.data as ApiResponse<ChatType[]>;
    // Check if apiResponse.data is valid, otherwise return empty array
    // The previous code used (response.data as any).chats which implies non-standard response.
    // Assuming migration aligns with standard ApiResponse<T>.
    return apiResponse.data || [];
  },

  getSingleChat: async (chatId: string) => {
    // Updated endpoint to match socket file: /api/conversation/{id}
    const response = await apiClient.get(`/api/conversation/${chatId}`);

    // For single chat, backend might return a complex object not just ApiResponse<ChatWithMessages>
    // Based on previous code, it returned { chat, messages }.
    // If the backend migration kept "REST API endpoints continue to work", the structure should be similar.
    // However, if the endpoint changed name, the structure might have too.
    // I will attempt to preserve the logic of extracting messages, 
    // but assuming standard ApiResponse container first if possible.
    // Previous code: response.data.messages.

    // Let's assume response.data IS the payload (maybe not wrapped in code/message/data if legacy?).
    // But other methods use ApiResponse.
    // Let's assume response.data.data has the info?
    // Or response.data directly.
    // I'll stick to the previous extraction logic but on the new URL logic, 
    // effectively trusting the extracted properties exist.

    const data = response.data.data || response.data; // Try to unwrap if wrapped
    const rawMessages = data.messages;

    let messages: MessageType[] = [];
    let pagination: any =
      data.pagination ?? rawMessages?.pagination ?? null;

    if (Array.isArray(rawMessages)) {
      messages = rawMessages as MessageType[];
    } else if (rawMessages && rawMessages.items) {
      messages = rawMessages.items as MessageType[];
    }

    return {
      chat: data.chat as ChatType,
      messages,
      pagination,
    };
  },

  createChat: async (payload: CreateChatPayload): Promise<ChatType> => {
    const response = await apiClient.post("/api/conversation/create", payload);
    const apiResponse = response.data as ApiResponse<ChatType>;

    // Handle backend error response
    if (apiResponse.code !== "0000") {
      throw new Error(apiResponse.message || "Failed to create conversation");
    }

    if (!apiResponse.data) {
      throw new Error("No conversation data returned");
    }

    // Normalize the response to our ChatType format
    return normalizeChatResponse(apiResponse.data);
  },

  // Messages
  sendMessage: async (payload: CreateMessagePayload): Promise<MessageType | null> => {
    // If WebSocket is connected, use it
    if (stompClient && isConnected) {
      const message = {
        conversationId: payload.chatId,
        content: payload.content,
        // image: payload.image, // TODO: Handle image via WS if supported by backend DTO
        type: payload.image ? "IMAGE" : "TEXT",
        timestamp: new Date().toISOString(),
      };

      stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(message),
      });

      // Return null to indicate handled via WS
      return null;
    }

    // Fallback to REST API
    // Endpoint updated to match socket file: /api/conversation/message/send
    const response = await apiClient.post("/api/conversation/message/send", payload);
    const apiResponse = response.data as ApiResponse<MessageType>;

    // Handle backend error response
    if (apiResponse.code !== "0000") {
      throw new Error(apiResponse.message || "Failed to send message");
    }

    if (!apiResponse.data) {
      throw new Error("No message data returned");
    }

    // Normalize the response to our MessageType format
    return normalizeMessageResponse(apiResponse.data);
  },

  // WebSocket
  connectWebSocket: (
    token: string,
    onMessage: (message: any) => void,
    onNotification: (notification: any) => void,
    onError: (error: any) => void
  ) => {
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

        // Subscribe to messages
        stompClient?.subscribe("/user/queue/messages", (message: IMessage) => {
          const response = JSON.parse(message.body);
          onMessage(response);
        });

        // Subscribe to notifications
        stompClient?.subscribe(
          "/user/queue/notifications",
          (notification: IMessage) => {
            const response = JSON.parse(notification.body);
            onNotification(response);
          }
        );

        // Subscribe to errors
        stompClient?.subscribe("/user/queue/errors", (error: IMessage) => {
          const response = JSON.parse(error.body);
          onError(response);
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
        onError(frame);
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
    }
  },

  // Users
  getAllUsers: async () => {
    const response = await apiClient.get("/api/user/all");
    return response.data.users as UserType[];
  },
};

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
 */
export function normalizeMessageResponse(data: any): MessageType {
  return {
    id: data.id,
    _id: String(data.id),
    content: data.content,
    image: data.image,
    sender: normalizeUserResponse(data.sender),
    replyTo: data.replyTo ? normalizeMessageResponse(data.replyTo) : undefined,
    chatId: data.chatId || "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    status: "sent",
  };
}

/**
 * Normalize user response from backend to UserType format
 */
function normalizeUserResponse(data: any): UserType {
  return {
    id: data.id,
    _id: String(data.id),
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    isOnline: data.isOnline,
  };
}
