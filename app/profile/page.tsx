'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Phone, Mail, Calendar, Edit, Share2, MessageCircle, Plus, Loader2, Eye } from 'lucide-react';
import authService from '@/services/authService';
import userService from '@/services/userService';
import petPostService from '@/services/petPostService';

interface UserProfile {
  id: string | number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  bio?: string;
  address?: string;
  city?: string;
  district?: string;
  createdAt: string;
  isVerified?: boolean;
}

interface PostItem {
  id: string;
  title: string;
  slug: string;
  image: string;
  status: 'LOST' | 'FOUND' | 'FOR_ADOPTION' | 'RESCUE';
  petType: string;
  location: string;
  views: number;
  createdAt: string;
}

interface PostCardProps {
  post: PostItem;
  isFavorited?: boolean;
  onFavoriteToggle?: (postId: string) => void;
}

// Post Card Component
function PostCard({ post, isFavorited = false, onFavoriteToggle }: PostCardProps) {
  const statusColors = {
    LOST: 'bg-red-100 text-red-800',
    FOUND: 'bg-blue-100 text-blue-800',
    FOR_ADOPTION: 'bg-green-100 text-green-800',
    RESCUE: 'bg-orange-100 text-orange-800',
  };

  const statusLabels = {
    LOST: 'Thất lạc',
    FOUND: 'Tìm thấy',
    FOR_ADOPTION: 'Cần nhà',
    RESCUE: 'Cứu hộ',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative h-48 overflow-hidden bg-gray-200 flex-shrink-0">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover hover:scale-105 transition-transform"
        />
        <Badge className={`absolute top-3 right-3 ${statusColors[post.status]}`}>
          {statusLabels[post.status]}
        </Badge>
      </div>
      <CardContent className="pt-4 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-2 mb-2">{post.title}</h3>
        <div className="space-y-2 text-sm text-muted-foreground mb-3 flex-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{post.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">🐾 {post.petType}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onFavoriteToggle?.(post.id)}
          >
            <Heart
              className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
            />
            Quan tâm
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-1" />
            Liên hệ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleFavorite = async (postId: string) => {
    const idNum = Number(postId);
    if (Number.isNaN(idNum)) return;
    try {
      await petPostService.toggleFavorite(idNum);
      await fetchFavoritePosts(); // refresh saved list
    } catch (err) {
      console.error('Favorite toggle failed', err);
    }
  };

  const fetchProfile = async () => {
      setIsLoading(true);
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      setUser({
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber || '0912345678',
        avatarUrl: currentUser.avatarUrl,
        bio: 'Yêu thích các thú cưng và muốn giúp đỡ những bạn lông lông',
        address: '123 Đường Lê Lợi',
        city: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        createdAt: currentUser.createdAt || new Date().toISOString(),
        isVerified: true,
      });

      try {
        const resp = await userService.getProfile();
        const profile = resp?.data || resp;

        setUser((prev) => ({
          id: profile.id || prev?.id || '',
          fullName: profile.fullName || profile.name || prev?.fullName || '',
          email: profile.email || prev?.email || '',
          phoneNumber: profile.phoneNumber || profile.phone || prev?.phoneNumber || '',
          avatarUrl: profile.avatarUrl || profile.avatar || prev?.avatarUrl,
          bio: profile.bio || prev?.bio,
          address: profile.address || prev?.address,
          city: profile.city || prev?.city,
          district: profile.district || prev?.district,
          createdAt: profile.createdAt || prev?.createdAt || new Date().toISOString(),
          isVerified: profile.isVerified ?? prev?.isVerified,
        }));
      } catch (err) {
        // Keep the user data from localStorage
      } finally {
        setIsLoading(false);
      }
    };

  const normalizePosts = (postsContent: any[]): PostItem[] =>
    postsContent.map((p: any) => ({
      id: String(p.id),
      title: p.title,
      slug: p.slug,
      image: p.image || p.thumbnail || 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500',
      status: (p.status || 'LOST').toUpperCase() as 'LOST' | 'FOUND' | 'FOR_ADOPTION' | 'RESCUE',
      petType: p.petType || p.type || 'Thú cưng',
      location: p.location || `${p.district || ''}, ${p.city || ''}`.replace(/^, |, $/g, '') || 'Chưa xác định',
      views: p.views || 0,
      createdAt: p.createdAt,
    }));

  const fetchMyPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const response = await petPostService.getMyPosts();
      const isSuccess = (response as any).success ?? (response as any).code === '0000';
      let postsContent: any[] = [];

      if (isSuccess && response.data) {
        const payload: any = response.data;
        if (Array.isArray(payload?.posts)) {
          postsContent = payload.posts;
        } else if (Array.isArray(payload?.content)) {
          postsContent = payload.content;
        } else if (Array.isArray(response.data)) {
          postsContent = response.data;
        }
      }

      setMyPosts(normalizePosts(postsContent));
    } catch (err: any) {
      console.error('Failed to load my posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchFavoritePosts = async () => {
    setIsLoadingSaved(true);
    try {
      const response = await petPostService.getFavoritePosts();
      const dto: any = response;
      const posts = dto?.data?.posts || dto?.data?.content || [];
      const normalized = normalizePosts(posts);
      setSavedPosts(normalized);
      setFavorites(new Set(normalized.map((p) => p.id)));
    } catch (err) {
      console.error('Failed to load saved posts', err);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchMyPosts();
    fetchFavoritePosts();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Đang tải thông tin...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Vui lòng đăng nhập để xem thông tin cá nhân</p>
            <Button
              className="mt-4"
              variant="default"
              onClick={() => (window.location.href = '/sign-in')}
            >
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberSince = new Date(user.createdAt);
  const memberMonths = Math.floor(
    (new Date().getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header Card */}
        <Card className="mb-6 overflow-hidden border-2">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-primary">
                  <AvatarImage
                    src={user.avatarUrl}
                    alt={user.fullName}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="text-3xl">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                {user.isVerified && (
                  <Badge variant="default" className="bg-green-600">
                    ✓ Đã xác thực
                  </Badge>
                )}
              </div>

              {/* User Info Section */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{user.fullName}</h1>
                  <p className="text-muted-foreground text-lg">{user.bio}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {user.district}, {user.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Thành viên {memberMonths > 0 ? `${memberMonths} tháng` : 'mới'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Button variant="default" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa hồ sơ
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Chia sẻ
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Liên hệ
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="posts">Bài đăng của tôi ({myPosts.length})</TabsTrigger>
            <TabsTrigger value="favorites">Đã quan tâm ({savedPosts.length})</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân chi tiết</CardTitle>
                <CardDescription>Quản lý thông tin hồ sơ của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase">
                        Họ và tên
                      </label>
                      <p className="text-lg font-medium mt-1">{user.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase">
                        Email
                      </label>
                      <p className="text-lg font-medium mt-1">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase">
                        Số điện thoại
                      </label>
                      <p className="text-lg font-medium mt-1">{user.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase">
                        Địa chỉ
                      </label>
                      <p className="text-lg font-medium mt-1">{user.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase">
                        Quận/Huyện
                      </label>
                      <p className="text-lg font-medium mt-1">{user.district}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase">
                        Thành phố
                      </label>
                      <p className="text-lg font-medium mt-1">{user.city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase">
                        Ngày tham gia
                      </label>
                      <p className="text-lg font-medium mt-1">
                        {memberSince.toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase">
                        Xác thực
                      </label>
                      <p className="text-lg font-medium mt-1">
                        {user.isVerified ? (
                          <Badge variant="default" className="bg-green-600 w-fit">
                            ✓ Đã xác thực
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit">
                            Chưa xác thực
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase">
                      Tiểu sử
                    </label>
                    <p className="text-base mt-1 text-justify leading-relaxed">
                      {user.bio ||
                        'Chưa cập nhật tiểu sử. Hãy cập nhật để mọi người hiểu rõ hơn về bạn!'}
                    </p>
                  </div>

                  <Button variant="default" className="w-full md:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Cập nhật thông tin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Bài đăng của tôi</CardTitle>
                <CardDescription>Quản lý các bài đăng về thú cưng của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPosts ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Đang tải bài đăng...</p>
                  </div>
                ) : myPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Bạn chưa có bài đăng nào. Hãy bắt đầu bằng cách đăng bài đầu tiên!
                    </p>
                    <Button variant="default" asChild>
                      <Link href="/post/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Đăng bài mới
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        isFavorited={favorites.has(post.id)}
                        onFavoriteToggle={toggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Bài đăng đã quan tâm</CardTitle>
                <CardDescription>
                  Các bài đăng mà bạn đã đánh dấu để theo dõi sau
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSaved ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Đang tải bài đã lưu...</p>
                  </div>
                ) : savedPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Bạn chưa quan tâm bài đăng nào. Hãy khám phá các bài đăng!
                    </p>
                    <Button variant="default" asChild>
                      <Link href="/shop">Duyệt bài đăng</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        isFavorited={favorites.has(post.id)}
                        onFavoriteToggle={toggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
