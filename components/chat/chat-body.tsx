"use client";

import { useChat } from "@/hooks/useChat";
import { useRef, useEffect, useCallback } from "react";
import type { MessageType } from "@/lib/chat.types";
import ChatMessageItem from "@/components/chat/chat-message-item";
import { Loader2 } from "lucide-react";

interface Props {
  onReply?: (message: MessageType) => void;
}

export function ChatBody({ onReply }: Props) {
  const { messages, isMessagesLoading, refreshMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {

    console.debug("ChatBody mounted", { messagesLength: messages.length });
    return () => {

      console.debug("ChatBody unmounted");
    };
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleRecall = useCallback(async () => {
    await refreshMessages();
  }, [refreshMessages]);

  if (isMessagesLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div data-chat-body="true" className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessageItem
              key={message._id}
              message={message}
              onReply={onReply}
              onRecall={handleRecall}
            />
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
}
