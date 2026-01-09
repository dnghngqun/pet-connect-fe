'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import friendRequestService, { FriendStatusDTO } from '@/services/friendRequestService';

interface FriendRequestButtonProps {
  userId: number;
  userName?: string;
  onStatusChange?: (status: string) => void;
}

export default function FriendRequestButton({ userId, userName, onStatusChange }: FriendRequestButtonProps) {
  const [status, setStatus] = useState<FriendStatusDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkFriendStatus();
  }, [userId]);

  const checkFriendStatus = async () => {
    try {
      setChecking(true);
      const response = await friendRequestService.getFriendStatus(userId);
      if (response.success) {
        setStatus(response.data);
        onStatusChange?.(response.data.status);
      }
    } catch (error) {
      console.error('Error checking friend status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      setLoading(true);
      const response = await friendRequestService.sendFriendRequest(userId);
      
      if (response.success) {
        toast({
          title: '✅ Đã gửi lời mời kết bạn',
          description: `Đã gửi lời mời kết bạn tới ${userName || 'người dùng'}`,
        });
        await checkFriendStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể gửi lời mời kết bạn',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!status?.requestId) return;
    
    try {
      setLoading(true);
      const response = await friendRequestService.cancelFriendRequest(status.requestId);
      
      if (response.success) {
        toast({
          title: 'Đã hủy lời mời',
          description: 'Đã hủy lời mời kết bạn',
        });
        await checkFriendStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể hủy lời mời',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!status?.requestId) return;
    
    try {
      setLoading(true);
      const response = await friendRequestService.acceptFriendRequest(status.requestId);
      
      if (response.success) {
        toast({
          title: '🎉 Đã kết bạn!',
          description: `Bạn và ${userName || 'người dùng'} đã trở thành bạn bè`,
        });
        await checkFriendStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể chấp nhận lời mời',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!status?.requestId) return;
    
    try {
      setLoading(true);
      const response = await friendRequestService.rejectFriendRequest(status.requestId);
      
      if (response.success) {
        toast({
          title: 'Đã từ chối',
          description: 'Đã từ chối lời mời kết bạn',
        });
        await checkFriendStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể từ chối lời mời',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Clock className="h-4 w-4 mr-2 animate-spin" />
        Đang kiểm tra...
      </Button>
    );
  }

  if (!status) return null;
  if (status.status === 'FRIENDS') {
    return (
      <Button variant="outline" size="sm" disabled>
        <UserCheck className="h-4 w-4 mr-2" />
        Bạn bè
      </Button>
    );
  }
  if (status.status === 'PENDING_SENT') {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleCancelRequest}
        disabled={loading}
      >
        <Clock className="h-4 w-4 mr-2" />
        Đang chờ
        <X className="h-3 w-3 ml-2" />
      </Button>
    );
  }
  if (status.status === 'PENDING_RECEIVED') {
    return (
      <div className="flex gap-2">
        <Button 
          variant="default" 
          size="sm"
          onClick={handleAcceptRequest}
          disabled={loading}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Chấp nhận
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRejectRequest}
          disabled={loading}
        >
          Từ chối
        </Button>
      </div>
    );
  }
  return (
    <Button 
      variant="default" 
      size="sm"
      onClick={handleSendRequest}
      disabled={loading}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      Kết bạn
    </Button>
  );
}
