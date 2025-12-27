"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Minus, Send, Paperclip, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useMiniChat, MiniChatItem } from "@/contexts/mini-chat-context";
import { chatAPI, normalizeMessageResponse } from "@/services/chatService";
import type { MessageType, ChatType } from "@/lib/chat.types";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MiniChatWindowProps {
  chat: MiniChatItem;
  index: number;
}

export function MiniChatWindow({ chat, index }: MiniChatWindowProps) {
  const { closeMiniChat, toggleMinimize, setChatId } = useMiniChat();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);

  // Calculate position from right
  const rightPosition = 20 + index * 340; // 340px per window (320px width + 20px gap)

  // Open in full chat page
  const handleOpenInFullChat = () => {
    closeMiniChat(chat.participantId);
    router.push(`/chat?participantId=${chat.participantId}`);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create or load chat on mount
  useEffect(() => {
    async function initChat() {
      if (!user) return;
      setIsLoading(true);
      try {
        // Create or get existing chat
        const newChat = await chatAPI.createChat({
          participantId: chat.participantId,
        });
        
        const validId = newChat._id || (newChat.id ? String(newChat.id) : null);
        
        if (!validId) {
             throw new Error("Received invalid chat ID from backend");
        }

        setChatId(chat.participantId, validId);
        setCurrentChat(newChat);

        // Load messages
        const { messages: fetchedMessages } = await chatAPI.getSingleChat(validId);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to init mini chat:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initChat();
  }, [chat.participantId, user, setChatId]);

  // Listen for WebSocket messages
  useEffect(() => {
    const chatIdToListen = chat.chatId || currentChat?._id;
    if (!chatIdToListen) return;

    const handleNewMessage = (wsResponse: any) => {
      // Extract message data from WebSocket response wrapper
      const messageData = wsResponse?.data || wsResponse;
      
      if (!messageData || !messageData.chatId) return;
      
      // Only handle messages for this chat
      if (String(messageData.chatId) !== String(chatIdToListen)) return;
      
      const normalizedMsg = normalizeMessageResponse(messageData);
      
      // Add to messages if not already present (avoid duplicates)
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m._id === normalizedMsg._id || 
                 (m._id?.startsWith('temp_') && m.content === normalizedMsg.content)
        );
        if (exists) {
          // Update temp message with real one
          return prev.map((m) =>
            m._id?.startsWith('temp_') && m.content === normalizedMsg.content
              ? { ...normalizedMsg, status: 'sent' }
              : m
          );
        }
        return [...prev, normalizedMsg];
      });
    };

    const cleanup = chatAPI.addMessageListener(handleNewMessage);
    return cleanup;
  }, [chat.chatId, currentChat?._id]);

  const handleSend = useCallback(async () => {
    const messageContent = content.trim();
    // Prioritize context chat ID, then currentChat state
    let chatIdToUse = chat.chatId;
    if (!chatIdToUse && currentChat) {
         chatIdToUse = currentChat._id || (currentChat.id ? String(currentChat.id) : null);
    }
    
    if (!messageContent || !chatIdToUse || chatIdToUse === "undefined") {
        console.error("Cannot send message: missing chat ID", { chat, currentChat });
        return;
    }
    if (isSending) return;

    const optimisticMessage: MessageType = {
      _id: `temp_${Date.now()}`,
      content: messageContent,
      sender: {
        _id: user?._id || "",
        name: user?.name || "",
        email: user?.email || "",
      },
      chatId: chatIdToUse,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setContent("");
    setIsSending(true);

    try {
      const sentMessage = await chatAPI.sendMessage({
        chatId: chatIdToUse,
        content: messageContent,
      });

      if (sentMessage) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === optimisticMessage._id
              ? { ...sentMessage, status: "sent" }
              : m
          )
        );
      } else {
        // WebSocket handled it - mark as sent
        setMessages((prev) =>
          prev.map((m) =>
            m._id === optimisticMessage._id
              ? { ...m, status: "sent" }
              : m
          )
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === optimisticMessage._id ? { ...m, status: "failed" } : m
        )
      );
    } finally {
      setIsSending(false);
    }
  }, [content, chat.chatId, currentChat, user, isSending]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isCurrentUser = (message: MessageType) => {
    return message.sender._id === user?._id || message.sender._id === String(user?._id);
  };

  return (
    <div
      className="fixed bottom-0 z-50 flex flex-col bg-white rounded-t-lg shadow-2xl border border-gray-200 overflow-hidden"
      style={{
        right: rightPosition,
        width: 320,
        height: 450,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {chat.participant.avatar ? (
            <Image
              src={chat.participant.avatar}
              alt={chat.participant.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
              {chat.participant.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-sm truncate">
            {chat.participant.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={handleOpenInFullChat}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Mở trong Tin nhắn</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={() => toggleMinimize(chat.participantId)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={() => closeMiniChat(chat.participantId)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={cn(
                "flex",
                isCurrentUser(message) ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] px-3 py-2 rounded-2xl text-sm",
                  isCurrentUser(message)
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-white text-gray-900 border rounded-bl-sm",
                  message.status === "sending" && "opacity-60",
                  message.status === "failed" && "bg-red-100 text-red-600"
                )}
              >
                <p>{message.content}</p>
                {message.image && (
                  <Image
                    src={message.image}
                    alt="Attached"
                    width={200}
                    height={150}
                    className="rounded mt-1"
                  />
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="p-2 border-t bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Aa"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending || isLoading || (!chat.chatId && !currentChat)}
            className="flex-1 h-9 rounded-full text-sm"
          />
          <Button
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={handleSend}
            disabled={isSending || !content.trim() || isLoading || (!chat.chatId && !currentChat)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
