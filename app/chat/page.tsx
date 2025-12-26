"use client";

import { Suspense } from "react";
import { ChatProvider } from "@/hooks/useChat";
import { ChatContainer } from "@/components/chat/chat-container";
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function ChatContent() {
  const params = useSearchParams();
  const participantId = params?.get('participantId') || undefined;
  const demo = params?.get('demo') === '1';

  return (
    <ChatProvider demo={demo}>
      <ChatContainer initialParticipantId={participantId} />
    </ChatProvider>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChatContent />
    </Suspense>
  );
}
