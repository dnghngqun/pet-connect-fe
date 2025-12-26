"use client";

import { ChatProvider } from "@/hooks/useChat";
import { ChatContainer } from "@/components/chat/chat-container";
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const params = useSearchParams();
  const participantId = params?.get('participantId') || undefined;
  const demo = params?.get('demo') === '1';

  return (
    <ChatProvider demo={demo}>
      <ChatContainer initialParticipantId={participantId} />
    </ChatProvider>
  );
}
