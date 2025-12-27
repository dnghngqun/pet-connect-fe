"use client";

import { useMiniChat } from "@/contexts/mini-chat-context";
import { MiniChatWindow } from "./mini-chat-window";
import { MiniChatBubble } from "./mini-chat-bubble";

export function MiniChatContainer() {
  const { openChats } = useMiniChat();

  // Separate expanded and minimized chats
  const expandedChats = openChats.filter((c) => !c.isMinimized);
  const minimizedChats = openChats.filter((c) => c.isMinimized);

  return (
    <>
      {/* Expanded chat windows */}
      {expandedChats.map((chat, index) => (
        <MiniChatWindow
          key={chat.participantId}
          chat={chat}
          index={index}
        />
      ))}

      {/* Minimized chat bubbles */}
      {minimizedChats.map((chat, index) => (
        <MiniChatBubble
          key={chat.participantId}
          chat={chat}
          index={index}
        />
      ))}
    </>
  );
}
