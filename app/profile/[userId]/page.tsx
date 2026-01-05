'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserProfile, getUserPosts } from '@/services/userService';
import friendRequestService from '@/services/friendRequestService';
import authService from '@/services/authService';
import ProfileHeader from '@/components/profile/profile-header';
import ProfileIntro from '@/components/profile/profile-intro';
import ProfilePhotos from '@/components/profile/profile-photos';
import ProfileFriendsPreview from '@/components/profile/profile-friends-preview';
import PetPostCard from '@/components/pet-post-card';
import PostCreateModal from '@/components/post-create-modal';
import ProfileFriendsTab from '@/components/profile/profile-friends-tab';
import ProfilePhotosTab from '@/components/profile/profile-photos-tab';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [friendsPreview, setFriendsPreview] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const currentUser = authService.getCurrentUser();
  
  // Calculate if own profile
  const isOwnProfile = currentUser?.id?.toString() === resolvedParams.userId || currentUser?._id === resolvedParams.userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile(resolvedParams.userId);
        
        if (userData.success && userData.data) {
          const user = userData.data;
          setProfile({
            ...user,
            isOwnProfile,
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.userId, isOwnProfile]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await friendRequestService.getUserFriends(resolvedParams.userId, 0, 9);
        if (response.success && response.data) {
           const friendsList = Array.isArray(response.data) ? response.data : [];
           // Map to preview format
           const mappedFriends = friendsList.map((f: any) => ({
             id: f.friendId || f.userId, // Depend on DTO
             name: f.friendName || f.userName || f.name,
             avatarUrl: f.friendAvatar || f.userAvatar || f.avatar || '',
           })).filter((f: any) => f.id !== null);
           
           setFriendsPreview(mappedFriends);
        }
      } catch (err) {
        console.error('Error fetching friends preview:', err);
      }
    };
    
    if (resolvedParams.userId) {
        fetchFriends();
    }
  }, [resolvedParams.userId]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        const response = await getUserPosts(resolvedParams.userId, 0, 10);
        if (response.success && response.data?.posts) {
          setPosts(response.data.posts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setPostsLoading(false);
      }
    };

    if (profile) {
      fetchPosts();
    }
  }, [resolvedParams.userId, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground flex-col gap-4">
        <p>Người dùng không tồn tại</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  // Derive photos for sidebar preview
  const photosPreview = posts
    .filter((p: any) => p.image)
    .slice(0, 9)
    .map((p: any) => ({ id: p.id, url: p.image }));

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b md:hidden">
        <div className="px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>

      <ProfileHeader profile={profile} />

      <div className="container max-w-5xl mx-auto px-0 md:px-4 mt-4">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start h-12 bg-white rounded-lg shadow-sm p-1 mb-4 sticky top-[60px] z-40 md:static">
            <TabsTrigger value="posts" className="flex-1 md:flex-none md:w-32">Bài viết</TabsTrigger>
            <TabsTrigger value="about" className="flex-1 md:flex-none md:w-32">Giới thiệu</TabsTrigger>
            <TabsTrigger value="friends" className="flex-1 md:flex-none md:w-32">Bạn bè</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1 md:flex-none md:w-32">Ảnh</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 px-2 md:px-0">
              {/* Left Column: Intro */}
              <div className="md:col-span-3 space-y-4 hidden md:block">
                <ProfileIntro 
                  bio={profile.bio} 
                  address={profile.address || profile.city}
                  joinedDate={profile.createdAt}
                  isOwnProfile={isOwnProfile}
                />
                
                <ProfilePhotos photos={photosPreview} seeAllLink={`/profile/${resolvedParams.userId}?tab=photos`} />
                
                <ProfileFriendsPreview 
                  friends={friendsPreview}
                  totalFriends={profile.friendsCount || friendsPreview.length || 0}
                  seeAllLink={`/profile/${resolvedParams.userId}?tab=friends`} 
                />
              </div>

              {/* Right Column: Feed */}
              <div className="md:col-span-4 space-y-4">
                {/* Mobile Intro (Simplified) */}
                <div className="md:hidden space-y-4">
                  <ProfileIntro bio={profile.bio} joinedDate={profile.createdAt} isOwnProfile={isOwnProfile} />
                </div>

                {isOwnProfile && (
                  <Card className="p-4 bg-white shadow-sm">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={currentUser?.avatarUrl} />
                        <AvatarFallback>{currentUser?.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button 
                        variant="outline" 
                        className="flex-1 rounded-full justify-start text-muted-foreground hover:bg-gray-100 px-4 h-10"
                        onClick={() => setCreatePostOpen(true)}
                      >
                        Bạn đang nghĩ gì thế?
                      </Button>
                    </div>
                    <PostCreateModal open={createPostOpen} onOpenChange={setCreatePostOpen} />
                  </Card>
                )}

                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PetPostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center text-muted-foreground">
                    <p>Chưa có bài viết nào</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Chi tiết về {profile.fullName}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-muted-foreground">Tiểu sử</h3>
                  <p>{profile.bio || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-muted-foreground">Thông tin liên hệ</h3>
                  <p>Email: {profile.email || 'Ẩn'}</p>
                  <p>Số điện thoại: {profile.phoneNumber || 'Ẩn'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-muted-foreground">Ngày tham gia</h3>
                  <p>{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="friends">
            <ProfileFriendsTab userId={resolvedParams.userId} />
          </TabsContent>

          <TabsContent value="photos">
            <ProfilePhotosTab userId={resolvedParams.userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
