'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getFriends, getPendingRequests, unfriend, acceptFriendRequest, rejectFriendRequest, Friendship, FriendRequest } from '@/services/friendshipService';
import authService from '@/services/authService';
import { useRouter } from 'next/navigation';

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await getFriends(0, 50);
      if (response.success) {
        setFriends(response.data || []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await getPendingRequests(0, 20);
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleUnfriend = async (friendId: number) => {
    if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;
    
    try {
      await unfriend(friendId);
      loadFriends();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await acceptFriendRequest(requestId);
      loadRequests();
      loadFriends();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await rejectFriendRequest(requestId);
      loadRequests();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-orange-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-2">Bạn bè</h1>
            <p className="text-lg opacity-90">
              Quản lý bạn bè và lời mời kết bạn
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="friends" className="space-y-6">
            <TabsList>
              <TabsTrigger value="friends">
                Bạn bè ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="requests">
                Lời mời ({requests.length})
                {requests.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {requests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Friends List */}
            <TabsContent value="friends">
              {friends.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Bạn chưa có bạn bè nào
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Tìm kiếm và kết nối với những người yêu thú cưng
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <Card key={friend.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.userAvatar} />
                          <AvatarFallback>
                            {friend.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{friend.userName}</p>
                          {friend.userCity && (
                            <p className="text-sm text-muted-foreground">
                              {friend.userCity}
                            </p>
                          )}
                          {friend.mutualFriendsCount && friend.mutualFriendsCount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {friend.mutualFriendsCount} bạn chung
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/profile/${friend.userId}`)}
                          className="flex-1"
                        >
                          Xem trang
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnfriend(friend.userId)}
                          className="text-red-600"
                        >
                          Hủy kết bạn
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Friend Requests */}
            <TabsContent value="requests">
              {requests.length === 0 ? (
                <Card className="p-12 text-center">
                  <UserPlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Không có lời mời kết bạn
                  </p>
                  <p className="text-muted-foreground">
                    Khi có người gửi lời mời, nó sẽ hiện ở đây
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.senderAvatar} />
                          <AvatarFallback>
                            {request.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{request.senderName}</p>
                          {request.senderCity && (
                            <p className="text-sm text-muted-foreground">
                              {request.senderCity}
                            </p>
                          )}
                          {request.mutualFriendsCount && request.mutualFriendsCount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {request.mutualFriendsCount} bạn chung
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request.id)}
                          className="flex-1"
                        >
                          Chấp nhận
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                        >
                          Từ chối
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
