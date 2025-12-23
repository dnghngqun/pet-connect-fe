"use client";

import { useState } from "react";
import { ChatList } from "./chat-list";
import { ChatHeader } from "./chat-header";
import { ChatBody } from "./chat-body";
import { ChatFooter } from "./chat-footer";
import { NewChatDialog } from "./new-chat-dialog";
import type { MessageType } from "@/lib/chat.types";

import { useEffect } from "react";
import { useChat } from "@/hooks/useChat";

export function ChatContainer({ initialParticipantId }: { initialParticipantId?: string }) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const { createChat, selectChat } = useChat();

  useEffect(() => {
    if (!initialParticipantId) return;

    (async () => {
      try {
        const newChat = await createChat({ participantId: initialParticipantId });
        if (newChat) {
          setSelectedChatId(newChat._id);
          // also select chat to load messages
          await selectChat(newChat._id);
        }
      } catch (err) {
        console.error('Failed to create/select chat for participant:', err);
      }
    })();
  }, [initialParticipantId, createChat, selectChat]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
          <NewChatDialog onChatCreated={setSelectedChatId} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
          />
        </div>
      </div>

      {/* Chat Main Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatBody onReply={setReplyTo} />
        <ChatFooter onReplyCancel={() => setReplyTo(null)} replyTo={replyTo} />
      </div>
    </div>
  );
}
