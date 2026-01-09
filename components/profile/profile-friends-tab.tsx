'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import friendRequestService from '@/services/friendRequestService';
import FriendRequestButton from '@/components/friend-request-button';
import authService from '@/services/authService';

interface ProfileFriendsTabProps {
  userId: string;
}

export default function ProfileFriendsTab({ userId }: ProfileFriendsTabProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const currentUser = authService.getCurrentUser();

  const fetchFriends = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await friendRequestService.getUserFriends(userId, pageNum, 12);
      
      if (data.success && Array.isArray(data.data)) {
        if (pageNum === 0) {
          setFriends(data.data);
        } else {
          setFriends(prev => [...prev, ...data.data]);
        }
        

        if (data.data.length < 12) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchFriends(0);
  }, [userId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFriends(nextPage);
  };

  if (loading && friends.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>Người dùng này chưa có bạn bè nào.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Bạn bè</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {friends.map((friend) => {
          


          

          
          const friendId = friend.friendId || friend.userId;
          const friendName = friend.friendName || friend.userName;
          const friendAvatar = friend.friendAvatar || friend.userAvatar;
          

          if (currentUser && (friendId === currentUser.id)) return null;

          return (
            <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
              <Link href={`/profile/${friendId}`} className="flex items-center gap-3">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={friendAvatar} />
                  <AvatarFallback>{friendName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-base">{friendName}</h3>
                  <p className="text-xs text-muted-foreground">{friend.mutualFriendsCount || 0} bạn chung</p>
                </div>
              </Link>
              
              <div className="flex flex-col gap-2">
                 
                 {currentUser && currentUser.id !== friendId && (
                    <FriendRequestButton userId={friendId} userName={friendName} />
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Xem thêm
          </Button>
        </div>
      )}
    </Card>
  );
}
