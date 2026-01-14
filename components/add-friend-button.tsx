'use client';

import { useState } from 'react';
import { UserPlus, UserMinus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendFriendRequest, unfriend } from '@/services/friendshipService';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/common/confirm-modal';

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
  const [isUnfriendModalOpen, setIsUnfriendModalOpen] = useState(false);

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      await sendFriendRequest(userId);
      setLocalIsPending(true);
      onUpdate?.();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Có lỗi xảy ra khi gửi lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = () => {
    setIsUnfriendModalOpen(true);
  };

  const confirmUnfriend = async () => {
    try {
      setLoading(true);
      await unfriend(userId);
      setLocalIsFriend(false);
      setLocalIsPending(false);
      onUpdate?.();
      toast.success('Đã hủy kết bạn');
    } catch (error) {
      console.error('Error unfriending:', error);
      toast.error('Có lỗi xảy ra');
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
    <>
      <Button
        size="sm"
        onClick={handleAddFriend}
        disabled={loading}
        className="gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Kết bạn
      </Button>
      <ConfirmModal 
        isOpen={isUnfriendModalOpen}
        onClose={() => setIsUnfriendModalOpen(false)}
        onConfirm={confirmUnfriend}
        title="Hủy kết bạn"
        message="Bạn có chắc chắn muốn hủy kết bạn không?"
        confirmText="Hủy kết bạn"
        cancelText="Đóng"
        isDestructive={true}
      />
    </>
  );
}
