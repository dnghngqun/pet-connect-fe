'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  postedBy: {
    id?: string;
    _id?: string;
    name?: string;
    phone?: string;
  };
}

export default function ChatButton({ postedBy }: ChatButtonProps) {
  const router = useRouter();

  const handleChat = () => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const participantId = postedBy?.id || postedBy?._id;
    if (!participantId) {
      router.push('/chat');
      return;
    }

    router.push(`/chat?participantId=${encodeURIComponent(participantId)}`);
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleChat}>
      <MessageCircle className="h-4 w-4 mr-2" />
      Gửi tin nhắn
    </Button>
  );
}

