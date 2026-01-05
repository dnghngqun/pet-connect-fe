'use client';

import { useState } from 'react';
import { UserPlus, UserMinus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendFriendRequest, unfriend } from '@/services/friendshipService';

interface AddFriendButtonProps {
  userId: number;
  isFriend?: boolean;
  isPending?: boolean;
  onUpdate?: () => void;
}

export default function AddFriendButton({
  userId,
  isFriend = false,
  isPending = false,
  onUpdate,
}: AddFriendButtonProps) {
  const [loading, setLoading] = useState(false);
  const [localIsFriend, setLocalIsFriend] = useState(isFriend);
  const [localIsPending, setLocalIsPending] = useState(isPending);

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      await sendFriendRequest(userId);
      setLocalIsPending(true);
      onUpdate?.();
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;
    
    try {
      setLoading(true);
      await unfriend(userId);
      setLocalIsFriend(false);
      setLocalIsPending(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error unfriending:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (localIsFriend) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnfriend}
        disabled={loading}
        className="gap-2"
      >
        <UserMinus className="h-4 w-4" />
        Bạn bè
      </Button>
    );
  }

  if (localIsPending) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Clock className="h-4 w-4" />
        Đã gửi lời mời
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleAddFriend}
      disabled={loading}
      className="gap-2"
    >
      <UserPlus className="h-4 w-4" />
      Kết bạn
    </Button>
  );
}
