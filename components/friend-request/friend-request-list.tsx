'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, UserX, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import friendRequestService, { FriendRequestDTO } from '@/services/friendRequestService';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function FriendRequestList() {
  const [requests, setRequests] = useState<FriendRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await friendRequestService.getPendingRequests();

      const list = Array.isArray(data) ? data : (data as any).data || [];
      setRequests(list);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number, userName: string) => {
    try {
      const response = await friendRequestService.acceptFriendRequest(requestId);
      if (response) {
        toast({
          title: 'Đã chấp nhận',
          description: `Đã trở thành bạn bè với ${userName}`,
        });

        setRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể chấp nhận lời mời',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await friendRequestService.rejectFriendRequest(requestId);
      toast({
        title: 'Đã từ chối',
        description: 'Đã từ chối lời mời kết bạn',
      });
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải lời mời...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">Không có lời mời kết bạn nào</p>
        <p className="text-sm text-muted-foreground">Các lời mời kết bạn mới sẽ xuất hiện tại đây</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {requests.map((request) => (
        <Card key={request.id} className="overflow-hidden flex flex-col">
          <Link href={`/profile/${request.senderId}`} className="block aspect-square relative bg-muted">
            {request.senderAvatar ? (
              <img 
                src={request.senderAvatar} 
                alt={request.senderName}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </Link>
          
          <div className="p-3 flex flex-col gap-2 flex-1">
            <Link href={`/profile/${request.senderId}`} className="font-semibold hover:underline truncate">
              {request.senderName}
            </Link>
            
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: vi })}
            </span>
            
            <div className="mt-auto grid gap-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleAccept(request.id, request.senderName)}
              >
                Xác nhận
              </Button>
              <Button 
                variant="secondary" 
                className="w-full bg-gray-200 hover:bg-gray-300 text-black"
                onClick={() => handleReject(request.id)}
              >
                Xóa
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
