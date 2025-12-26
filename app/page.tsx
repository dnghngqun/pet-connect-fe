'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MapPin, Users, MessageSquare, Loader2 } from 'lucide-react';
import PetPostCard from '@/components/pet-post-card';
import HeroSlider from '@/components/hero-slider';
import petPostService from '@/services/petPostService';

interface PetPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  petType: string;
  status: string;
  location: string;
  postedBy: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  createdAt: string;
  tags: string[];
  featured?: boolean;
}

export default function Home() {
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await petPostService.getPosts({ size: 20 });
      // Transform API response to match expected format
      // Backend returns: postedBy { id, name, phone, avatar }
      const transformedPosts = (response.data?.content || []).map((post: any) => ({
        id: String(post.id),
        title: post.title,
        slug: post.slug,
        description: post.description,
        image: post.image || 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
        petType: post.petType,
        status: post.status?.toLowerCase().replace('_', '-') || 'lost',
        location: post.location || `${post.district || ''}, ${post.city || ''}`,
        postedBy: {
          id: String(post.postedBy?.id || ''),
          name: post.postedBy?.name || 'Người dùng',
          phone: post.postedBy?.phone || '',
          avatar: post.postedBy?.avatar,
        },
        createdAt: post.createdAt,
        tags: post.tags || [],
        featured: post.featured,
      }));
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredPosts = posts.filter(post => post.featured).slice(0, 8);
  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Slider */}
      <HeroSlider
        slides={[
          {
            image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1920&auto=format&fit=crop',
            title: 'PetConnect - Mạng xã hội cứu hộ thú cưng',
            description: 'Kết nối cộng đồng yêu động vật, đăng thú cưng thất lạc, tìm nhà cho thú cưng cần nhận nuôi.',
            buttonText: 'Đăng bài ngay',
            buttonLink: '/post/new',
          },
          {
            image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?q=80&w=1920&auto=format&fit=crop',
            title: 'Cứu hộ động vật',
            description: 'Tìm kiếm thú cưng thất lạc hoặc giúp đỡ các tổ chức cứu hộ.',
            buttonText: 'Tìm kiếm',
            buttonLink: '/shop?status=lost,rescue',
          },
          {
            image: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?q=80&w=1920&auto=format&fit=crop',
            title: 'Nhận nuôi thú cưng',
            description: 'Tìm bạn thân mến trong danh sách các thú cưng cần gia đình yêu thương.',
            buttonText: 'Xem các bé',
            buttonLink: '/shop?status=for-adoption',
          },
        ]}
      />

      {/* Features Section */}
      <section className="py-12 bg-muted">
        <div className="container px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="flex flex-col items-center text-center p-8">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Cứu hộ động vật</h3>
                <p className="text-sm text-muted-foreground mt-2">Tìm kiếm và giúp đỡ những thú cưng thất lạc</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm">
              <CardContent className="flex flex-col items-center text-center p-8">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Kết nối theo địa điểm</h3>
                <p className="text-sm text-muted-foreground mt-2">Tìm các bài đăng gần vị trí của bạn</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm">
              <CardContent className="flex flex-col items-center text-center p-8">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Cộng đồng yêu động vật</h3>
                <p className="text-sm text-muted-foreground mt-2">Kết nối với những người cùng đam mê</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm">
              <CardContent className="flex flex-col items-center text-center p-8">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Chat & Liên hệ</h3>
                <p className="text-sm text-muted-foreground mt-2">Giao tiếp trực tiếp với người đăng bài</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Bài đăng nổi bật</h2>
              <p className="text-muted-foreground mt-2">Những thú cưng cần sự giúp đỡ của bạn</p>
            </div>
            <Button asChild variant="link" className="text-primary mt-2 md:mt-0">
              <Link href="/shop">Xem tất cả</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredPosts.map((post) => (
                <PetPostCard key={post.id} post={post as any} />
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentPosts.slice(0, 8).map((post) => (
                <PetPostCard key={post.id} post={post as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Chưa có bài đăng nào
            </div>
          )}
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-16 bg-muted">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Bài đăng gần đây</h2>
              <p className="text-muted-foreground mt-2">Những cập nhật mới nhất từ cộng đồng</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <PetPostCard key={post.id} post={post as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Chưa có bài đăng nào
            </div>
          )}

          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link href="/shop">Xem tất cả bài đăng</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Tham gia cộng đồng PetConnect</h2>
            <p className="text-white/90 mb-6">Nhận thông báo về những bài đăng mới, tin tức cứu hộ, và các sự kiện cộng đồng.</p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input type="email" placeholder="Địa chỉ email của bạn" className="px-4 py-2 rounded-md flex-1 text-black" required />
              <Button className="bg-white text-primary hover:bg-white/90">Đăng ký</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
