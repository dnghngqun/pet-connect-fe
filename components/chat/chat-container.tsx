"use client";

import { useState } from "react";
import { ChatList } from "./chat-list";
import { ChatHeader } from "./chat-header";
import { ChatBody } from "./chat-body";
import { ChatFooter } from "./chat-footer";
import { NewChatDialog } from "./new-chat-dialog";
import type { MessageType } from "@/lib/chat.types";

import React, { useEffect } from "react";
import { useChat } from "@/hooks/useChat";

export function ChatContainer({ initialParticipantId }: { initialParticipantId?: string }) {
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const { createChat, selectChat, selectedChatId } = useChat();

  const isMounted = React.useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!initialParticipantId) return;

    (async () => {
      try {
        const newChat = await createChat({ participantId: initialParticipantId });
        if (isMounted.current && newChat && newChat._id) {
          // also select chat to load messages
          await selectChat(newChat._id);
        }
      } catch (err) {
        if (isMounted.current) {
          console.error('Failed to create/select chat for participant:', err);
        }
      }
    })();
  }, [initialParticipantId, createChat, selectChat]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug("ChatContainer mounted", { initialParticipantId });
    return () => {
      // eslint-disable-next-line no-console
      console.debug("ChatContainer unmounted");
    };
  }, [initialParticipantId]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList />
        </div>
      </div>

      {/* Chat Main Area */}
      <div className="flex-1 flex flex-col relative">
        <ChatHeader />
        <ChatBody onReply={setReplyTo} />
        <ChatFooter onReplyCancel={() => setReplyTo(null)} replyTo={replyTo} />
      </div>
    </div>
  );
}
