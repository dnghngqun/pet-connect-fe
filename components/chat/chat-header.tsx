"use client";

import { useChat } from "@/hooks/useChat";
import type { ChatType } from "@/lib/chat.types";
import { Loader2 } from "lucide-react";
import Image from "next/image";

function getOtherParticipant(chat: ChatType, currentUserId: string | undefined) {
  if (chat.isGroup) return null;
  return chat.participants.find((p) => p._id !== currentUserId);
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

export function ChatHeader() {
  const { currentChat, isMessagesLoading, currentUser } = useChat();

  if (!currentChat) {
    return (
      <div className="border-b bg-white p-4 flex items-center justify-center h-20">
        <p className="text-gray-500">Chọn cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  const displayName = getChatDisplayName(currentChat, currentUser?._id);
  const otherUser = getOtherParticipant(currentChat, currentUser?._id);

  return (
    <div className="border-b bg-white p-4 flex items-center justify-between h-20">
      <div className="flex items-center gap-3">
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
        <div>
          <h2 className="font-semibold text-gray-900">{displayName}</h2>
          {otherUser && (
            <p className="text-xs text-gray-500">
              {otherUser.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
            </p>
          )}
        </div>
      </div>

      {isMessagesLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
    </div>
  );
}
