'use client';

import { useEffect, useState } from 'react';
import FriendRequestList from '@/components/friend-request/friend-request-list';
import { Users, PawPrint, Heart, Sparkles, Loader2, MessageCircle, UserMinus } from 'lucide-react';
import { getFriends, unfriend } from '@/services/friendshipService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { useChat } from '@/hooks/useChat';
import { useRouter } from 'next/navigation';

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { createChat } = useChat();
  const router = useRouter();

  const fetchFriends = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await getFriends(pageNum, 12);
      
      if ((data.code === '0000' || data.success) && data.data) {
        // Handle both paginated (content array) and direct array response
        const newFriends = Array.isArray(data.data) ? data.data : (data.data.content || []);
        if (pageNum === 0) {
          setFriends(newFriends);
        } else {
          setFriends((prev) => [...prev, ...newFriends]);
        }
        
        // Check if more pages
        const totalPages = data.totalPages || 1;
        if (pageNum >= totalPages - 1 || newFriends.length < 12) {
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
    fetchFriends(0);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFriends(nextPage);
  };

  const handleUnfriend = async (friendId: number, friendName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${friendName}?`)) return;

    try {
      await unfriend(friendId);
      setFriends((prev) => prev.filter((f) => f.friendId !== friendId && f.userId !== friendId)); // Check both just in case
      toast({
        title: "Đã hủy kết bạn",
        description: `Đã hủy kết bạn với ${friendName}`,
      });
    } catch (error) {
      console.error('Error unfriending:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi hủy kết bạn",
        variant: "destructive",
      });
    }
  };

  const handleChat = async (friendId: number) => {
    try {
      const chat = await createChat({ participantId: String(friendId) });
      if (chat) {
        router.push(`/chat?id=${chat._id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Lỗi",
        description: "Không thể bắt đầu cuộc trò chuyện",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-8 relative">
      {/* Decorative stickers */}
      <div className="absolute top-24 right-12 text-orange-200/30 animate-pulse">
        <Users size={36} />
      </div>
      <div className="absolute bottom-32 left-10 text-amber-200/30">
        <PawPrint size={32} className="rotate-12" />
      </div>
      <div className="absolute top-48 left-16 text-pink-200/30">
        <Heart size={24} />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Bạn bè
                </h1>
                <p className="text-sm text-muted-foreground">Kết nối với những người yêu thú cưng 🐾</p>
              </div>
            </div>
          </div>

          {/* Requests Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-400" />
                Lời mời kết bạn
              </h2>
              <span className="text-orange-500 hover:underline cursor-pointer text-sm font-medium">Xem tất cả</span>
            </div>
            
            <FriendRequestList />
          </div>

          {/* My Friends Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" />
                Danh sách bạn bè
              </h2>
            </div>
            
            {loading && friends.length === 0 ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : friends.length === 0 ? (
              <div className="p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-4">
                  <Users className="h-8 w-8 text-orange-400" />
                </div>
                <p className="text-muted-foreground">Chưa có danh sách bạn bè 🐕</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => {
                  const friendId = friend.friendId || friend.userId; // Adjust based on DTO
                  const friendName = friend.friendName || friend.userName;
                  const friendAvatar = friend.friendAvatar || friend.userAvatar;

                  return (
                    <div key={friend.id} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-all flex items-center justify-between group">
                      <Link href={`/profile/${friendId}`} className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-orange-100">
                          <AvatarImage src={friendAvatar} />
                          <AvatarFallback>{friendName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {friendName}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users size={12} />
                            {friend.mutualFriendsCount || 0} bạn chung
                          </p>
                        </div>
                      </Link>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handleChat(friendId)}
                          title="Nhắn tin"
                        >
                          <MessageCircle size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleUnfriend(friendId, friendName)}
                          title="Hủy kết bạn"
                        >
                          <UserMinus size={18} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {hasMore && friends.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={loadMore} 
                  disabled={loading}
                  className="bg-white/50 backdrop-blur-sm hover:bg-white/80"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Xem thêm
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

