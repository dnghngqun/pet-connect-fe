"use client";

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { chatAPI, normalizeMessageResponse } from "@/services/chatService";

export interface MiniChatParticipant {
  id: string;
  name: string;
  avatar?: string;
}

export interface MiniChatItem {
  chatId: string | null;
  participantId: string;
  participant: MiniChatParticipant;
  isMinimized: boolean;
  unreadCount: number;
}

interface MiniChatContextType {
  openChats: MiniChatItem[];
  openMiniChat: (participantId: string, participant: MiniChatParticipant) => void;
  closeMiniChat: (participantId: string) => void;
  toggleMinimize: (participantId: string) => void;
  setChatId: (participantId: string, chatId: string) => void;
  updateUnreadCount: (participantId: string, count: number) => void;
}

const MiniChatContext = createContext<MiniChatContextType | undefined>(undefined);

const MAX_OPEN_CHATS = 5;

export function MiniChatProvider({ children }: { children: ReactNode }) {
  const [openChats, setOpenChats] = useState<MiniChatItem[]>([]);

  const openMiniChat = useCallback(
    (participantId: string, participant: MiniChatParticipant) => {
      setOpenChats((prev) => {

        const existing = prev.find((c) => c.participantId === participantId);
        if (existing) {

          if (existing.isMinimized) {
            return prev.map((c) =>
              c.participantId === participantId
                ? { ...c, isMinimized: false }
                : c
            );
          }
          return prev;
        }
        const newChat: MiniChatItem = {
          chatId: null,
          participantId,
          participant,
          isMinimized: false,
          unreadCount: 0,
        };
        if (prev.length >= MAX_OPEN_CHATS) {
          const minimizedIndex = prev.findIndex((c) => c.isMinimized);
          if (minimizedIndex !== -1) {
            const newArr = [...prev];
            newArr.splice(minimizedIndex, 1);
            return [...newArr, newChat];
          }

          return [...prev.slice(1), newChat];
        }

        return [...prev, newChat];
      });
    },
    []
  );

  const closeMiniChat = useCallback((participantId: string) => {
    setOpenChats((prev) =>
      prev.filter((c) => c.participantId !== participantId)
    );
  }, []);

  const toggleMinimize = useCallback((participantId: string) => {
    setOpenChats((prev) =>
      prev.map((c) =>
        c.participantId === participantId
          ? { ...c, isMinimized: !c.isMinimized }
          : c
      )
    );
  }, []);

  const setChatId = useCallback((participantId: string, chatId: string) => {
    setOpenChats((prev) =>
      prev.map((c) =>
        c.participantId === participantId ? { ...c, chatId } : c
      )
    );
  }, []);

  const updateUnreadCount = useCallback(
    (participantId: string, count: number) => {
      setOpenChats((prev) =>
        prev.map((c) =>
          c.participantId === participantId ? { ...c, unreadCount: count } : c
        )
      );
    },
    []
  );
  const pathname = usePathname();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.token) return;

    const onMessage = (wsResponse: any) => {
      console.log("MiniChatContext onMessage:", wsResponse);
      


      const messageData = wsResponse?.data || wsResponse;
      

      if (!messageData || !messageData.sender) {
        console.warn("Invalid WebSocket message format:", wsResponse);
        return;
      }
      

      const msg = normalizeMessageResponse(messageData);
      

      if (pathname === '/chat') return;

      const senderId = String(msg.sender._id);
      const myId = String(user._id);
      
      if (senderId === myId) return;

      if (!senderId) return;
      
      console.log('Auto-opening mini chat for:', { senderId, msg });
      openMiniChat(senderId, {
        id: senderId,
        name: msg.sender.name || "Người dùng",
        avatar: msg.sender.avatar
      });
    };

    const onError = (error: any) => {

    };

    chatAPI.connectWebSocket(
      user.token!,
      undefined,
      undefined,
      onError
    );
    const cleanup = chatAPI.addMessageListener(onMessage);

    return () => {
      cleanup();
    };
  }, [user?.token, pathname, openMiniChat, user?._id]);

  return (
    <MiniChatContext.Provider
      value={{
        openChats,
        openMiniChat,
        closeMiniChat,
        toggleMinimize,
        setChatId,
        updateUnreadCount,
      }}
    >
      {children}
    </MiniChatContext.Provider>
  );
}

export function useMiniChat() {
  const context = useContext(MiniChatContext);
  if (context === undefined) {
    throw new Error("useMiniChat must be used within MiniChatProvider");
  }
  return context;
}
