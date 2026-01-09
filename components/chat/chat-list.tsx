"use client";

import { useChat } from "@/hooks/useChat";
import type { ChatType } from "@/lib/chat.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function getChatId(chat: ChatType): string {
  return chat._id || String(chat.id) || `temp_${Date.now()}_${Math.random()}`;
}

function getOtherParticipant(chat: ChatType, currentUserId: string | undefined) {
  if (chat.isGroup) return null;

  return chat.participants.find((p) => String(p._id) !== String(currentUserId));
}

function getChatDisplayName(
  chat: ChatType,
  currentUserId: string | undefined
): string {
  if (chat.isGroup) {
    return chat.groupName || "Cuộc trò chuyện nhóm";
  }
  const otherUser = getOtherParticipant(chat, currentUserId);
  return otherUser?.name || "Không xác định";
}

function getLastMessagePreview(chat: ChatType, currentUserId: string | undefined): string {
  if (!chat.lastMessage) {
    return chat.isGroup ? "Nhóm vừa tạo" : "Chưa có tin nhắn";
  }

  const message = chat.lastMessage;
  const isCurrentUserSender = String(message.sender._id) === String(currentUserId);

  if (message.image) {
    return isCurrentUserSender ? "Bạn đã gửi ảnh" : `${message.sender.name} gửi ảnh`;
  }

  if (chat.isGroup && !isCurrentUserSender) {
    return `${message.sender.name}: ${message.content || ""}`;
  }

  return message.content || "(Không có nội dung)";
}

export function ChatList() {
  const { chats, isChatsLoading, selectChat, selectedChatId, currentUser } = useChat();

  const handleSelectChat = async (chatId: string) => {
    await selectChat(chatId);
  };

  if (isChatsLoading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Không có cuộc trò chuyện nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {chats.map((chat) => {
        const displayName = getChatDisplayName(chat, currentUser?._id);
        const otherUser = getOtherParticipant(chat, currentUser?._id);
        const lastMessagePreview = getLastMessagePreview(chat, currentUser?._id);
        const lastMessageTime = chat.lastMessage
          ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
            addSuffix: false,
            locale: vi,
          })
          : formatDistanceToNow(new Date(chat.createdAt), {
            addSuffix: false,
            locale: vi,
          });

        return (
          <button
            key={getChatId(chat)}
            onClick={() => handleSelectChat(getChatId(chat))}
            className={cn(
              "w-full flex gap-3 p-3 rounded-lg hover:bg-white/40 transition-colors text-left border border-transparent hover:border-white/20",
              selectedChatId === getChatId(chat) && "bg-white/50 border-white/30 shadow-sm"
            )}
          >
            
            <div className="flex-shrink-0">
              {otherUser?.avatar ? (
                <Image
                  src={otherUser.avatar}
                  alt={otherUser.name || "User"}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 truncate">
                  {displayName}
                </h3>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  {lastMessageTime}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {lastMessagePreview}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
