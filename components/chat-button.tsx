'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useMiniChat } from '@/contexts/mini-chat-context';
import authService from '@/services/authService';

interface ChatButtonProps {
  postedBy: {
    id?: string;
    _id?: string;
    name?: string;
    phone?: string;
    avatar?: string;
  };
}

export default function ChatButton({ postedBy }: ChatButtonProps) {
  const router = useRouter();
  const { openMiniChat } = useMiniChat();

  const handleChat = () => {
    const user = typeof window !== 'undefined' ? authService.getCurrentUser() : null;
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const participantId = postedBy?.id || postedBy?._id;
    if (!participantId) {
      console.error('No participant ID found');
      return;
    }
    openMiniChat(participantId, {
      id: participantId,
      name: postedBy.name || 'Unknown User',
      avatar: postedBy.avatar,
    });
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleChat}>
      <MessageCircle className="h-4 w-4 mr-2" />
      Gửi tin nhắn
    </Button>
  );
}
