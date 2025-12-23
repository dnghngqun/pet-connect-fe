"use client";

import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import type {
  ChatType,
  CreateChatPayload,
  CreateMessagePayload,
  MessageType,
  UserType,
} from "@/lib/chat.types";
import { chatAPI } from "@/services/chatService";
import { useAuth } from "./useAuth";

interface ChatContextType {
  // State
  chats: ChatType[];
  users: UserType[];
  currentChat: ChatType | null;
  messages: MessageType[];
  selectedChatId: string | null;

  // Loading states
  isChatsLoading: boolean;
  isMessagesLoading: boolean;
  isUsersLoading: boolean;
  isSendingMessage: boolean;

  // Actions
  fetchAllChats: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  createChat: (payload: CreateChatPayload) => Promise<ChatType | null>;
  sendMessage: (payload: CreateMessagePayload) => Promise<MessageType | null>;
  refreshMessages: () => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // State
  const [chats, setChats] = useState<ChatType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Loading states
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch all chats
  const fetchAllChats = useCallback(async () => {
    if (!user?._id) return;

    setIsChatsLoading(true);
    try {
      const data = await chatAPI.getAllChats();
      setChats(data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setIsChatsLoading(false);
    }
  }, [user?._id]);

  // Fetch all users
  const fetchAllUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const data = await chatAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  // Select chat and fetch messages
  const selectChat = useCallback(
    async (chatId: string) => {
      if (!user?._id) return;

      setSelectedChatId(chatId);
      setIsMessagesLoading(true);
      try {
        const { chat, messages: fetchedMessages } =
          await chatAPI.getSingleChat(chatId);
        setCurrentChat(chat);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to fetch chat:", error);
      } finally {
        setIsMessagesLoading(false);
      }
    },
    [user?._id]
  );

  // Refresh messages (polling)
  const refreshMessages = useCallback(async () => {
    if (!selectedChatId || !user?._id) return;

    try {
      const { messages: fetchedMessages } =
        await chatAPI.getSingleChat(selectedChatId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to refresh messages:", error);
    }
  }, [selectedChatId, user?._id]);

  // Create chat
  const createChat = useCallback(
    async (payload: CreateChatPayload) => {
      if (!user?._id) return null;

      try {
        const newChat = await chatAPI.createChat(payload);
        setChats((prev) => [newChat, ...prev]);
        return newChat;
      } catch (error) {
        console.error("Failed to create chat:", error);
        return null;
      }
    },
    [user?._id]
  );

  // Send message
  const sendMessage = useCallback(
    async (payload: CreateMessagePayload) => {
      if (!user?._id || !selectedChatId) return null;

      // Create optimistic message
      const optimisticMessage: MessageType = {
        _id: `temp_${Date.now()}`,
        content: payload.content || "",
        image: payload.image || undefined,
        sender: user as UserType,
        chatId: selectedChatId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setIsSendingMessage(true);

      try {
        const sentMessage = await chatAPI.sendMessage(payload);
        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticMessage._id
              ? { ...sentMessage, status: "sent" }
              : msg
          )
        );
        return sentMessage;
      } catch (error) {
        console.error("Failed to send message:", error);
        // Mark message as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticMessage._id
              ? { ...msg, status: "failed" }
              : msg
          )
        );
        return null;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [user?._id, selectedChatId]
  );

  // Fetch chats on mount and set up polling
  useEffect(() => {
    if (!user?._id) return;

    fetchAllChats();
    const interval = setInterval(fetchAllChats, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user?._id, fetchAllChats]);

  // Polling for new messages
  useEffect(() => {
    if (!selectedChatId) return;

    const interval = setInterval(refreshMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [selectedChatId, refreshMessages]);

  const value: ChatContextType = {
    chats,
    users,
    currentChat,
    messages,
    selectedChatId,
    isChatsLoading,
    isMessagesLoading,
    isUsersLoading,
    isSendingMessage,
    fetchAllChats,
    fetchAllUsers,
    selectChat,
    createChat,
    sendMessage,
    refreshMessages,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = React.useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
