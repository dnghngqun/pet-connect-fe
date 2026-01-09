'use client';

import { Button } from '@/components/ui/button';
import { Phone, Share2, Flag } from 'lucide-react';
import ChatButton from '@/components/chat-button';

interface PetContactButtonsProps {
  postedBy: {
    id?: string;
    _id?: string;
    name?: string;
    phone?: string;
  };
}

export default function PetContactButtons({ postedBy }: PetContactButtonsProps) {
  const handleCall = () => {
    window.location.href = `tel:${postedBy.phone}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Pet Post',
        text: 'Check out this pet post!',
        url: window.location.href,
      });
    }
  };

  return (
    <>
      {/* Contact Buttons */}
      <div className="space-y-2 pt-4 border-t">
        <Button className="w-full" onClick={handleCall}>
          <Phone className="h-4 w-4 mr-2" />
          Gọi: {postedBy.phone}
        </Button>
        <ChatButton postedBy={postedBy} />
      </div>

      {/* Actions */}
      <div className="space-y-2 mt-6">
        <Button variant="outline" className="w-full" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Chia sẻ
        </Button>
        <Button variant="outline" className="w-full text-red-600">
          <Flag className="h-4 w-4 mr-2" />
          Báo cáo
        </Button>
      </div>
    </>
  );
}

