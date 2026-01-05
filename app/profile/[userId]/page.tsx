'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Users, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMiniChat } from '@/contexts/mini-chat-context';
import authService from '@/services/authService';
import { getUserProfile, getUserPosts } from '@/services/userService';

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { openMiniChat } = useMiniChat();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = authService.getCurrentUser();
  
  const isOwnProfile = currentUser?.id?.toString() === resolvedParams.userId || currentUser?._id === resolvedParams.userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUserProfile(resolvedParams.userId);
        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          setError('Không thể tải thông tin người dùng');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [resolvedParams.userId]);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        const response = await getUserPosts(resolvedParams.userId, 0, 20);
        if (response.success && response.data?.posts) {
          setPosts(response.data.posts);
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
      } finally {
        setPostsLoading(false);
      }
    };

    if (profile) {
      fetchPosts();
    }
  }, [resolvedParams.userId, profile]);

  const handleMessage = () => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }

    if (!profile) return;

    // Open mini-chat with this user
    openMiniChat(resolvedParams.userId, {
      id: resolvedParams.userId,
      name: profile.fullName || 'User',
      avatar: profile.avatarUrl,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{error || 'Không tìm thấy người dùng'}</h2>
            <p className="text-muted-foreground mb-4">
              Người dùng này không tồn tại hoặc đã bị xóa
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <Card className="mb-6">
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-orange-500/20">
                    {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-2">{profile.fullName}</h1>
                  {profile.bio && (
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  )}
                  {profile.city && (
                    <p className="text-sm text-muted-foreground mb-4">
                      📍 {profile.city}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <PawPrint className="h-3 w-3" />
                      {profile.postsCount || 0} bài viết
                    </Badge>
                    <Badge variant="secondary">{profile.followersCount || 0} người theo dõi</Badge>
                    <Badge variant="secondary">{profile.followingCount || 0} đang theo dõi</Badge>
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="flex gap-2">
                    <Button onClick={handleMessage} variant="default">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Nhắn tin
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Posts Section */}
          <Card>
            <CardHeader>
              <CardTitle>Bài viết ({profile.postsCount || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                  <p className="mt-2 text-muted-foreground">Đang tải bài viết...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="grid gap-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => router.push(`/pet/${post.slug}`)}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex gap-4">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {post.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{post.city}</span>
                            {post.views > 0 && <span>👁️ {post.views}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PawPrint className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isOwnProfile ? 'Bạn chưa có bài viết nào' : 'Người dùng này chưa có bài viết nào'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
