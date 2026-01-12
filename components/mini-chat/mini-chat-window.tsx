"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Minus, Send, Paperclip, Loader2, Maximize2, RefreshCcw } from "lucide-react";
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
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const lastSendRef = useRef<{ signature: string; time: number }>({
    signature: "",
    time: 0,
  });
  const pendingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

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

      let matchedTempId: string | null = null;

      setMessages((prev) => {
        const normalizedContent = normalizedMsg.content ?? "";
        const hasImage = Boolean(normalizedMsg.image);

        const index = prev.findIndex((m) => {
          if (m.chatId !== normalizedMsg.chatId) return false;
          if (m.status !== "sending" && m.status !== "failed") return false;
          const messageContent = m.content ?? "";
          if (messageContent !== normalizedContent) return false;
          if (hasImage && !(m.image || m.localImagePreview)) return false;
          return true;
        });

        if (index !== -1) {
          matchedTempId = prev[index]._id ?? null;
          const newMessages = [...prev];
          newMessages[index] = { ...normalizedMsg, status: "sent" };
          return newMessages;
        }

        if (prev.some((m) => m._id === normalizedMsg._id)) return prev;

        return [...prev, normalizedMsg];
      });

      if (matchedTempId) clearSendTimeout(matchedTempId);
    };

    const cleanup = chatAPI.addMessageListener(handleNewMessage);
    return cleanup;
  }, [chat.chatId, currentChat?._id, clearSendTimeout]);

  const sendMessageWithOptimistic = useCallback(
    async ({
      content: rawContent,
      imageFile,
      imagePreview,
      existingMessage,
    }: {
      content?: string;
      imageFile?: File | null;
      imagePreview?: string | null;
      existingMessage?: MessageType;
    }) => {
      const messageContent = rawContent?.trim() ?? "";
      let chatIdToUse = existingMessage?.chatId || chat.chatId;
      if (!chatIdToUse && currentChat) {
        chatIdToUse =
          currentChat._id || (currentChat.id ? String(currentChat.id) : null);
      }

      const hasImage = Boolean(
        imageFile ||
          imagePreview ||
          existingMessage?.image ||
          existingMessage?.localImagePreview
      );

      if (
        (!messageContent && !hasImage) ||
        !chatIdToUse ||
        chatIdToUse === "undefined"
      ) {
        console.error("Cannot send message: missing chat ID", {
          chat,
          currentChat,
        });
        return;
      }

      const optimisticId =
        existingMessage?._id ??
        `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const optimisticMessage: MessageType = {
        _id: optimisticId,
        content: messageContent || undefined,
        image: existingMessage?.image,
        localImagePreview: imagePreview || existingMessage?.localImagePreview,
        localImageFile: imageFile || existingMessage?.localImageFile,
        sender: {
          _id: user?._id || "",
          name: user?.name || "",
          email: user?.email || "",
        },
        chatId: chatIdToUse,
        createdAt: existingMessage?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "sending",
        errorMessage: undefined,
      };

      if (existingMessage) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === optimisticId
              ? { ...m, ...optimisticMessage, status: "sending", errorMessage: undefined }
              : m
          )
        );
      } else {
        setMessages((prev) => [...prev, optimisticMessage]);
      }

      scheduleSendTimeout(optimisticId);

      try {
        let uploadedImageUrl = existingMessage?.image;
        const fileToUpload =
          imageFile || existingMessage?.localImageFile || null;

        if (!uploadedImageUrl && fileToUpload) {
          uploadedImageUrl = await withTimeout(
            chatAPI.uploadChatImage(fileToUpload),
            SEND_TIMEOUT_MS,
            "Hết thời gian tải ảnh. Vui lòng thử lại."
          );
          setMessages((prev) =>
            prev.map((m) =>
              m._id === optimisticId ? { ...m, image: uploadedImageUrl } : m
            )
          );
        }

        const sentMessage = await withTimeout(
          chatAPI.sendMessage({
            chatId: chatIdToUse,
            content: messageContent || undefined,
            image: uploadedImageUrl,
          }),
          SEND_TIMEOUT_MS,
          "Hết thời gian gửi tin nhắn. Vui lòng thử lại."
        );

        if (sentMessage) {
          clearSendTimeout(optimisticId);
          setMessages((prev) =>
            prev.map((m) =>
              m._id === optimisticId ? { ...sentMessage, status: "sent" } : m
            )
          );
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error && error.message.includes("thời gian")
            ? error.message
            : "Gửi tin nhắn thất bại";
        console.error("Failed to send message:", errorMsg);
        markMessageFailed(optimisticId, errorMsg);
      }
    },
    [
      chat,
      chat.chatId,
      currentChat,
      user,
      scheduleSendTimeout,
      clearSendTimeout,
      markMessageFailed,
    ]
  );

  const handleSend = useCallback(() => {
    const messageContent = content.trim();
    if (!messageContent && !pendingImageFile && !pendingImagePreview) return;
    const chatIdReady = Boolean(
      chat.chatId || currentChat?._id || currentChat?.id
    );
    if (!chatIdReady) {
      console.error("Cannot send message: missing chat ID", {
        chat,
        currentChat,
      });
      return;
    }
    const signature = `${messageContent}::${pendingImageFile?.name ?? ""}::${
      pendingImageFile?.size ?? ""
    }`;
    const now = Date.now();
    if (
      signature === lastSendRef.current.signature &&
      now - lastSendRef.current.time < 500
    ) {
      return;
    }
    lastSendRef.current = { signature, time: now };

    void sendMessageWithOptimistic({
      content: messageContent,
      imageFile: pendingImageFile,
      imagePreview: pendingImagePreview,
    });

    setContent("");
    setPendingImageFile(null);
    setPendingImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, [
    content,
    pendingImageFile,
    pendingImagePreview,
    sendMessageWithOptimistic,
    chat,
    currentChat,
  ]);

  const handleRetryMessage = useCallback(
    (message: MessageType) => {
      void sendMessageWithOptimistic({
        content: message.content || "",
        imageFile: message.localImageFile || null,
        imagePreview: message.localImagePreview || null,
        existingMessage: message,
      });
    },
    [sendMessageWithOptimistic]
  );

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
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-500 text-white">
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
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          messages.map((message) => {
            const mine = isCurrentUser(message);
            const imageSrc = message.image || message.localImagePreview;
            const isLocalImage =
              imageSrc?.startsWith("data:") || imageSrc?.startsWith("blob:");

            return (
              <div
                key={message._id}
                className={cn("flex flex-col", mine ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-3 py-2 rounded-2xl text-sm",
                    mine
                      ? "bg-orange-500 text-white rounded-br-sm"
                      : "bg-white text-gray-900 border rounded-bl-sm",
                    message.status === "sending" && "opacity-70",
                    message.status === "failed" && "border border-red-500"
                  )}
                >
                  {message.content && <p>{message.content}</p>}
                  {imageSrc && (
                    <div className="mt-1">
                      {isLocalImage ? (
                        <img
                          src={imageSrc}
                          alt="Attached"
                          className="rounded"
                        />
                      ) : (
                        <Image
                          src={imageSrc}
                          alt="Attached"
                          width={200}
                          height={150}
                          className="rounded"
                        />
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                  <span>
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                  {mine && message.status === "sending" && (
                    <span>Đang gửi...</span>
                  )}
                  {mine && message.status === "sent" && (
                    <span className="text-green-600">Đã gửi</span>
                  )}
                </div>
                {message.status === "failed" && (
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-red-500">
                    <span>{message.errorMessage || "Gửi tin nhắn thất bại"}</span>
                    {mine && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => handleRetryMessage(message)}
                      >
                        <RefreshCcw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="p-2 border-t bg-white">
        {/* Image preview */}
        {pendingImagePreview && (
          <div className="mb-2 relative inline-block">
            <Image
              src={pendingImagePreview}
              alt="Preview"
              width={80}
              height={60}
              className="rounded object-cover"
            />
            <button
              onClick={() => {
                setPendingImageFile(null);
                setPendingImagePreview(null);
                if (imageInputRef.current) {
                  imageInputRef.current.value = "";
                }
              }}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          {/* Hidden file input */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              
              if (!file.type.startsWith('image/')) {
                console.error('Only image files are allowed');
                return;
              }

              setPendingImageFile(file);
              const reader = new FileReader();
              reader.onloadend = () =>
                setPendingImagePreview(reader.result as string);
              reader.readAsDataURL(file);
              if (imageInputRef.current) {
                imageInputRef.current.value = "";
              }
            }}
          />
          
          {/* Attachment button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full shrink-0"
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading || (!chat.chatId && !currentChat)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            placeholder="Aa"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || (!chat.chatId && !currentChat)}
            className="flex-1 h-9 rounded-full text-sm"
          />
          <Button
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={handleSend}
            disabled={
              isLoading ||
              (!chat.chatId && !currentChat) ||
              (!content.trim() && !pendingImageFile && !pendingImagePreview)
            }
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
