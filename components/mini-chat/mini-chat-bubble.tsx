"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMiniChat, MiniChatItem } from "@/contexts/mini-chat-context";
import { cn } from "@/lib/utils";

interface MiniChatBubbleProps {
  chat: MiniChatItem;
  index: number;
}

export function MiniChatBubble({ chat, index }: MiniChatBubbleProps) {
  const { closeMiniChat, toggleMinimize } = useMiniChat();

  // Position bubbles from right to left
  const rightPosition = 20 + index * 60; // 60px per bubble (48px width + 12px gap)

  return (
    <div
      className="fixed hidden bottom-5 z-50 group"
      style={{ right: rightPosition }}
    >
      {/* Close button on hover */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          closeMiniChat(chat.participantId);
        }}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Bubble */}
      <button
        onClick={() => toggleMinimize(chat.participantId)}
        className="relative w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow ring-2 ring-white overflow-hidden bg-gradient-to-br from-orange-500 to-orange-500"
      >
        {chat.participant.avatar ? (
          <Image
            src={chat.participant.avatar}
            alt={chat.participant.name}
            fill
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
            {chat.participant.name.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Unread badge */}
        {chat.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
            {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
          </span>
        )}
      </button>

      {/* Name tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {chat.participant.name}
      </div>
    </div>
  );
}
