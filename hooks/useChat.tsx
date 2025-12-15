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
  currentUser: UserType | null;
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

export function ChatProvider({ children, demo }: { children: ReactNode; demo?: boolean }) {
  const { user } = useAuth();
  // Demo mode: when `demo` is true, use local mock data and skip API calls.
  // This lets frontend run without backend responses during testing.
  const DEMO_USER: UserType = {
    _id: "demo_user_1",
    name: "Demo User",
    email: "demo@example.com",
    avatar: undefined,
    isOnline: true,
  };
  const DEMO_USER_2: UserType = {
    _id: "user_2",
    name: "Nguyễn Văn B",
    email: "b@example.com",
    avatar: "https://i.pravatar.cc/150?img=32",
    isOnline: true,
  };
  const DEMO_USER_3: UserType = {
    _id: "user_3",
    name: "Trần Thị C",
    email: "c@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    isOnline: false,
  };
  const DEMO_USERS: UserType[] = [DEMO_USER, DEMO_USER_2, DEMO_USER_3];
  const currentUser = demo ? DEMO_USER : user;

  // State
  const [chats, setChats] = useState<ChatType[]>(() => (demo ? [] : []));
  const [users, setUsers] = useState<UserType[]>(() => (demo ? [] : []));
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
    if (!currentUser?._id) return;

    setIsChatsLoading(true);
    try {
      if (demo) {
        // Provide demo chats (two conversations)
        const demoChats: ChatType[] = [
          {
            _id: "chat_demo_1",
            participants: [currentUser as UserType, DEMO_USER_2],
            isGroup: false,
            createdBy: (currentUser as UserType)._id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessage: undefined,
          },
          {
            _id: "chat_demo_2",
            participants: [currentUser as UserType, DEMO_USER_3],
            isGroup: false,
            createdBy: (currentUser as UserType)._id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessage: undefined,
          },
        ];
        setChats(demoChats);
      } else {
        const data = await chatAPI.getAllChats();
        setChats(data);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setIsChatsLoading(false);
    }
  }, [currentUser?._id, demo]);

  // Fetch all users
  const fetchAllUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      if (demo) {
        // Provide three demo users
        setUsers(DEMO_USERS);
      } else {
        const data = await chatAPI.getAllUsers();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsUsersLoading(false);
    }
  }, [demo, currentUser]);

  // Select chat and fetch messages
  const selectChat = useCallback(
    async (chatId: string) => {
      if (!currentUser?._id) return;

      setSelectedChatId(chatId);
      setIsMessagesLoading(true);
      try {
        if (demo) {
          // Create a few demo messages depending on chatId
          const userA = DEMO_USER;
          const userB = DEMO_USER_2;
          const userC = DEMO_USER_3;

          // Message examples: text from userB, image from userC, reply from demo user
          const msg1: MessageType = {
            _id: "msg_demo_1",
            content: "Xin chào, bạn còn bé husky không?",
            image: undefined,
            sender: userB,
            replyTo: undefined,
            chatId,
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            status: "sent",
          };

          const msg2: MessageType = {
            _id: "msg_demo_2",
            content: undefined,
            image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
            sender: userC,
            replyTo: undefined,
            chatId,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: "sent",
          };

          const msg3: MessageType = {
            _id: "msg_demo_3",
            content: "Vâng còn 1 bé, bạn muốn xem ảnh không?",
            image: undefined,
            sender: userA,
            replyTo: msg1 as any,
            chatId,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            status: "sent",
          };

          const messagesDemo: MessageType[] = [msg1, msg2, msg3];

          // Choose participants based on chatId
          const participants = chatId === "chat_demo_2" ? [userA, userC] : [userA, userB];

          const demoChat: ChatType = {
            _id: chatId,
            participants,
            isGroup: false,
            createdBy: (currentUser as UserType)._id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessage: messagesDemo[messagesDemo.length - 1],
          };

          setCurrentChat(demoChat);
          setMessages(messagesDemo);
        } else {
          const { chat, messages: fetchedMessages } = await chatAPI.getSingleChat(chatId);
          setCurrentChat(chat);
          setMessages(fetchedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch chat:", error);
      } finally {
        setIsMessagesLoading(false);
      }
    },
    [currentUser?._id, demo, users]
  );

  // Refresh messages (polling)
  const refreshMessages = useCallback(async () => {
    if (!selectedChatId || !currentUser?._id) return;

    try {
      if (demo) {
        // no-op in demo or you can implement message append simulation
        return;
      }
      const { messages: fetchedMessages } = await chatAPI.getSingleChat(selectedChatId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to refresh messages:", error);
    }
  }, [selectedChatId, currentUser?._id, demo]);

  // Create chat
  const createChat = useCallback(
    async (payload: CreateChatPayload) => {
      if (!currentUser?._id) return null;

      try {
        if (demo) {
          const otherId = payload.participantId ?? `user_demo_${Date.now()}`;
          const newChat: ChatType = {
            _id: `chat_demo_${Date.now()}`,
            participants: [currentUser as UserType, { _id: otherId, name: "Người mới", email: "new@example.com" } as UserType],
            isGroup: !!payload.isGroup,
            createdBy: (currentUser as UserType)._id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessage: undefined,
          };
          setChats((prev) => [newChat, ...prev]);
          return newChat;
        }

        const newChat = await chatAPI.createChat(payload);
        setChats((prev) => [newChat, ...prev]);
        return newChat;
      } catch (error) {
        console.error("Failed to create chat:", error);
        return null;
      }
    },
    [currentUser?._id, demo]
  );

  // Send message
  const sendMessage = useCallback(
    async (payload: CreateMessagePayload) => {
      if (!currentUser?._id || !selectedChatId) return null;

      // Create optimistic message
      const optimisticMessage: MessageType = {
        _id: `temp_${Date.now()}`,
        content: payload.content || "",
        image: payload.image || undefined,
        sender: currentUser as UserType,
        chatId: selectedChatId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setIsSendingMessage(true);

      try {
        if (demo) {
          const saved: MessageType = {
            _id: `msg_demo_${Date.now()}`,
            content: payload.content || "",
            image: payload.image,
            sender: currentUser as UserType,
            chatId: selectedChatId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "sent",
          };
          // Replace optimistic message
          setMessages((prev) => prev.map((m) => (m._id === optimisticMessage._id ? { ...saved } : m)));
          return saved;
        }

        const sentMessage = await chatAPI.sendMessage(payload);
        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticMessage._id ? { ...sentMessage, status: "sent" } : msg
          )
        );
        return sentMessage;
      } catch (error) {
        console.error("Failed to send message:", error);
        // Mark message as failed
        setMessages((prev) => prev.map((msg) => (msg._id === optimisticMessage._id ? { ...msg, status: "failed" } : msg)));
        return null;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [currentUser?._id, selectedChatId, demo]
  );

  // Fetch chats on mount and set up polling
  useEffect(() => {
    if (!currentUser?._id) return;

    fetchAllChats();
    if (!demo) {
      const interval = setInterval(fetchAllChats, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
    // no polling in demo mode
  }, [currentUser?._id, fetchAllChats, demo]);

  // Polling for new messages
  useEffect(() => {
    if (!selectedChatId) return;

    if (!demo) {
      const interval = setInterval(refreshMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
    // no polling in demo mode
  }, [selectedChatId, refreshMessages, demo]);

  const value: ChatContextType = {
    chats,
    users,
    currentUser: (currentUser as unknown as UserType) ?? null,
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
