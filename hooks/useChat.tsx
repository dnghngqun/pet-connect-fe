"use client";

import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import type {
  ChatType,
  CreateChatPayload,
  CreateMessagePayload,
  MessageType,
  UserType,
} from "@/lib/chat.types";
import { chatAPI, normalizeMessageResponse } from "@/services/chatService";
import { useAuth } from "./useAuth";
import { useWebSocket } from "@/components/websocket-provider";

const SEND_TIMEOUT_MS = 30000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

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
  retryMessage: (message: MessageType) => Promise<void>;
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

  const messagesRef = useRef<MessageType[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Refs for callbacks
  const selectedChatIdRef = useRef(selectedChatId);
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  const pendingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearSendTimeout = useCallback((messageId: string) => {
    const timeoutId = pendingTimeoutsRef.current.get(messageId);
    if (timeoutId) clearTimeout(timeoutId);
    pendingTimeoutsRef.current.delete(messageId);
  }, []);

  const markMessageFailed = useCallback(
    (messageId: string, errorMessage: string) => {
      clearSendTimeout(messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId && msg.status !== "sent"
            ? { ...msg, status: "failed", errorMessage }
            : msg
        )
      );
    },
    [clearSendTimeout]
  );

  const scheduleSendTimeout = useCallback(
    (messageId: string) => {
      clearSendTimeout(messageId);
      const timeoutId = setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId && msg.status !== "sent"
              ? {
                  ...msg,
                  status: "failed",
                  errorMessage:
                    "Gửi tin nhắn quá thời gian. Vui lòng thử lại.",
                }
              : msg
          )
        );
        pendingTimeoutsRef.current.delete(messageId);
      }, SEND_TIMEOUT_MS);
      pendingTimeoutsRef.current.set(messageId, timeoutId);
    },
    [clearSendTimeout]
  );

  useEffect(() => {
    return () => {
      pendingTimeoutsRef.current.forEach((timeoutId) =>
        clearTimeout(timeoutId)
      );
      pendingTimeoutsRef.current.clear();
    };
  }, []);

  // WebSocket Handlers
  const handleWebSocketMessage = useCallback((response: any) => {
    console.log("useChat handleWebSocketMessage:", response);
    const rawData = response.data || response;

    // Check if it's a message
    if (response.type === 'MESSAGE' || (rawData.content && rawData.conversationId)) {
      const msgData = rawData;
      try {
        const normalized = normalizeMessageResponse(msgData);
        console.log("Normalized message:", normalized);

        // 1. Update Messages if belongs to current chat
        // Use ref to get current selectedChatId
        if (normalized.chatId === selectedChatIdRef.current) {
          let matchedTempId: string | null = null;

          setMessages((prev) => {
            const normalizedContent = normalized.content ?? "";
            const hasImage = Boolean(normalized.image);

            const index = prev.findIndex((m) => {
              if (m.chatId !== normalized.chatId) return false;
              if (m.status !== "sending" && m.status !== "failed") return false;
              const messageContent = m.content ?? "";
              if (messageContent !== normalizedContent) return false;
              if (hasImage && !(m.image || m.localImagePreview)) return false;
              return true;
            });

            if (index !== -1) {
              matchedTempId = prev[index]._id ?? null;
              const newMessages = [...prev];
              newMessages[index] = { ...normalized, status: "sent" };
              return newMessages;
            }

            // Avoid duplicates if already exists (via ID)
            if (prev.some((m) => m._id === normalized._id)) return prev;

            return [...prev, normalized];
          });

          if (matchedTempId) clearSendTimeout(matchedTempId);
        }

        // 2. Update Chat List (Last Message)
        setChats((prevChats) => {
          const chatIndex = prevChats.findIndex(c => c._id === normalized.chatId);
          if (chatIndex !== -1) {
            const newChats = [...prevChats];
            const updatedChat = {
              ...newChats[chatIndex],
              lastMessage: normalized,
              updatedAt: normalized.createdAt,
            };
            // Move updated chat to top
            newChats.splice(chatIndex, 1);
            newChats.unshift(updatedChat);
            return newChats;
          } else {
            // Chat not in list? Fetch it and add to top!
            // We can't use await here inside setState, so we trigger a side effect or separate action.
            // But we need to update state. 
            // Better approach: Call a function to fetch single Chat and add it.
            // Since we are in a callback, let's call fetchAndAddChat(normalized.chatId)
            
            // NOTE: We cannot easily async/await here.
            // Let's trigger it outside.
            if(normalized.chatId) fetchSingleChatAndAdd(normalized.chatId);
            return prevChats;  
          }
        });

      } catch (e) {
        console.error("Error processing WS message", e);
      }
    }
  }, []);

  // Helper to fetch single chat and add to list if not exists
  const fetchSingleChatAndAdd = useCallback(async (chatId: string) => {
    try {
        const { chat } = await chatAPI.getSingleChat(chatId);
        
        if (!chat) {
          console.warn(`FetchSingleChatAndAdd: Chat ${chatId} not found`);
          return;
        }

        setChats(prev => {
            if (prev.some(c => c._id === chat._id)) return prev; // already added by race condition
            return [chat, ...prev];
        });
    } catch (err) {
        console.error("Failed to fetch new chat details via WS", err);
    }
  }, []);

  const handleNotification = useCallback((response: any) => {
    // console.log("Notification received", response); 
    // Could Trigger fetchAllChats if notification implies new chat?
  }, []);

  const handleError = useCallback((error: any) => {
    console.error("WebSocket error", error);
  }, []);


  // WebSocket Subscription
  const { subscribe, isConnected } = useWebSocket();
  
  useEffect(() => {
    if (!isConnected || !currentUser?._id || demo) return;

    const sub = subscribe('/user/queue/messages', (message) => {
        if (message.body) {
             try {
                 const data = JSON.parse(message.body);
                 // handleWebSocketMessage expects "response" object possibly wrapped.
                 // Backend sends the message object directly? Or wrapped?
                 // handleWebSocketMessage handles "response.data || response".
                 handleWebSocketMessage(data);
             } catch (e) {
                 console.error("Error parsing chat message", e);
             }
        }
    });
    
    // Also subscribe to notifications here? useNotifications handles it globally but 
    // ChatProvider had a listener. Let's keep it minimal for now.
    // Ideally ChatProvider only cares about messages.

    return () => {
        sub?.unsubscribe();
    };
  }, [isConnected, currentUser, demo, handleWebSocketMessage, subscribe]);


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

  // Refresh messages (polling) - kept for manual refresh if needed
  const refreshMessages = useCallback(async () => {
    if (!selectedChatId || !currentUser?._id) return;

    try {
      if (demo) return;
      const { messages: fetchedMessages } = await chatAPI.getSingleChat(selectedChatId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to refresh messages:", error);
    }
  }, [selectedChatId, currentUser?._id, demo]);

  // Create chat
  const createChat = useCallback(
    async (payload: CreateChatPayload): Promise<ChatType | null> => {
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
        
        setChats((prev) => {
          // Normalize IDs to string for comparison
          const newId = String(newChat._id || newChat.id);
          const existsIndex = prev.findIndex(c => String(c._id || c.id) === newId);
          
          if (existsIndex !== -1) {
             // Move to top if exists
             const newChats = [...prev];
             const existing = newChats[existsIndex];
             newChats.splice(existsIndex, 1);
             return [existing, ...newChats];
          }
          return [newChat, ...prev];
        });
        
        return newChat;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to create chat";
        console.error("Failed to create chat:", errorMsg);
        // alert(`Lỗi: ${errorMsg}`); // Suppress alert for better UX
        return null;
      }
    },
    [currentUser?._id, demo]
  );

  const sendMessageInternal = useCallback(
    async (
      payload: CreateMessagePayload,
      options?: { existingMessage?: MessageType }
    ): Promise<MessageType | null> => {
      if (!currentUser?._id) return null;
      const chatId = payload.chatId || selectedChatId;
      if (!chatId) return null;

      const trimmedContent = payload.content?.trim();
      const hasImage = Boolean(
        payload.image ||
          payload.imageFile ||
          payload.localImagePreview ||
          options?.existingMessage?.image ||
          options?.existingMessage?.localImagePreview
      );
      if (!trimmedContent && !hasImage) return null;
      const replyTo =
        options?.existingMessage?.replyTo ||
        (payload.replyToId
          ? messagesRef.current.find(
              (msg) => String(msg._id) === String(payload.replyToId)
            )
          : undefined);

      const optimisticId =
        options?.existingMessage?._id ??
        `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const createdAt = options?.existingMessage?.createdAt ?? new Date().toISOString();
      const updatedAt = new Date().toISOString();

      const optimisticMessage: MessageType = {
        _id: optimisticId,
        content: trimmedContent,
        image: payload.image || undefined,
        localImagePreview:
          payload.localImagePreview || options?.existingMessage?.localImagePreview,
        localImageFile: payload.imageFile || options?.existingMessage?.localImageFile,
        sender: currentUser as UserType,
        chatId,
        replyTo,
        createdAt,
        updatedAt,
        status: "sending",
        errorMessage: undefined,
      };

      if (options?.existingMessage) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticId
              ? { ...msg, ...optimisticMessage, status: "sending", errorMessage: undefined }
              : msg
          )
        );
      } else {
        setMessages((prev) => [...prev, optimisticMessage]);
      }

      scheduleSendTimeout(optimisticId);
      setIsSendingMessage(true);

      try {
        if (demo) {
          clearSendTimeout(optimisticId);
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === optimisticId ? { ...optimisticMessage, status: "sent" } : msg
            )
          );
          return optimisticMessage;
        }

        let uploadedImageUrl = payload.image;
        if (!uploadedImageUrl && optimisticMessage.localImageFile) {
          uploadedImageUrl = await withTimeout(
            chatAPI.uploadChatImage(optimisticMessage.localImageFile),
            SEND_TIMEOUT_MS,
            "Hết thời gian tải ảnh. Vui lòng thử lại."
          );
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === optimisticId ? { ...msg, image: uploadedImageUrl } : msg
            )
          );
        }

        const sentMessage = await withTimeout(
          chatAPI.sendMessage({
            ...payload,
            chatId,
            content: trimmedContent,
            image: uploadedImageUrl,
          }),
          SEND_TIMEOUT_MS,
          "Hết thời gian gửi tin nhắn. Vui lòng thử lại."
        );

        // If handled via WS (returnValue is null), we keep the optimistic message.
        // It will be replaced when the broadcast is received.
        if (sentMessage === null) {
          return optimisticMessage;
        }

        clearSendTimeout(optimisticId);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticId ? { ...sentMessage, status: "sent" } : msg
          )
        );

        // Update Chat List (Last Message) manually for REST
        setChats((prevChats) => {
          const chatIndex = prevChats.findIndex((c) => c._id === chatId);
          if (chatIndex !== -1) {
            const newChats = [...prevChats];
            newChats[chatIndex] = {
              ...newChats[chatIndex],
              lastMessage: sentMessage,
              updatedAt: sentMessage.createdAt,
            };
            const updatedChat = newChats[chatIndex];
            newChats.splice(chatIndex, 1);
            newChats.unshift(updatedChat);
            return newChats;
          }
          return prevChats;
        });

        return sentMessage;
      } catch (error) {
        const errorMsg =
          error instanceof Error && error.message.includes("thời gian")
            ? error.message
            : "Gửi tin nhắn thất bại";
        console.error("Failed to send message:", errorMsg);
        markMessageFailed(optimisticId, errorMsg);
        return null;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [
      currentUser?._id,
      selectedChatId,
      demo,
      scheduleSendTimeout,
      clearSendTimeout,
      markMessageFailed,
    ]
  );

  const sendMessage = useCallback(
    async (payload: CreateMessagePayload) => sendMessageInternal(payload),
    [sendMessageInternal]
  );

  const retryMessage = useCallback(
    async (message: MessageType) => {
      if (!message.chatId) return;
      await sendMessageInternal(
        {
          chatId: message.chatId,
          content: message.content,
          image: message.image,
          imageFile: message.localImageFile,
          localImagePreview: message.localImagePreview,
          replyToId: message.replyTo?._id,
        },
        { existingMessage: message }
      );
    },
    [sendMessageInternal]
  );

  // Fetch chats on mount and when tab becomes active
  useEffect(() => {
    if (!currentUser?._id) return;

    // Initial fetch
    fetchAllChats();

    if (!demo) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          console.log("Tab active, fetching latest chats...");
          fetchAllChats();
        }
      };

      const handleWindowFocus = () => {
        // console.log("Window focused, fetching chats...");
        fetchAllChats();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleWindowFocus);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleWindowFocus);
      };
    }
  }, [currentUser?._id, fetchAllChats, demo]);

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
    retryMessage,
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
