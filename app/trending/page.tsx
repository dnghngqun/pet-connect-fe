'use client';

import { useState, useEffect } from 'react';
import { Flame, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import PostTypeBadge from '@/components/post-type-badge';
import TagChips from '@/components/tag-chips';
import { useRouter } from 'next/navigation';

export default function TrendingPage() {
  const router = useRouter();
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchTrendingPosts();
  }, [timeRange]);

  const fetchTrendingPosts = async () => {
    setLoading(true);
    try {
      // Fetch posts sorted by views and reactions (trending algorithm)
      const params = new URLSearchParams({
        page: '0',
        size: '20',
        sort: 'views,desc',
        featured: 'true',
      });

      const response = await fetch(`/api/v1/posts?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.data?.posts) {
        setTrendingPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (slug: string) => {
    router.push(`/pet/${slug}`);
  };

  const categories = [
    { id: 'dog', name: 'Chó', emoji: '🐕', count: 0, color: 'from-amber-100 to-orange-100' },
    { id: 'cat', name: 'Mèo', emoji: '🐈', count: 0, color: 'from-purple-100 to-pink-100' },
    { id: 'lost', name: 'Thất lạc', emoji: '🔍', count: 0, color: 'from-red-100 to-rose-100' },
    { id: 'adoption', name: 'Nhận nuôi', emoji: '🏠', count: 0, color: 'from-green-100 to-emerald-100' },
    { id: 'review', name: 'Review', emoji: '⭐', count: 0, color: 'from-yellow-100 to-amber-100' },
    { id: 'qna', name: 'Hỏi đáp', emoji: '❓', count: 0, color: 'from-blue-100 to-cyan-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="h-10 w-10" />
            <h1 className="text-3xl font-bold">Trending</h1>
          </div>
          <p className="text-white/90 text-lg">
            Khám phá các bài viết nổi bật và được quan tâm nhất trong cộng đồng
          </p>
        </div>

        {/* Time Range Selector */}
        <Tabs value={timeRange} onValueChange={setTimeRange} className="mb-6">
          <TabsList className="bg-white">
            <TabsTrigger value="24h">
              <TrendingUp className="h-4 w-4 mr-2" />
              24 giờ qua
            </TabsTrigger>
            <TabsTrigger value="7d">
              <Calendar className="h-4 w-4 mr-2" />
              7 ngày qua
            </TabsTrigger>
            <TabsTrigger value="30d">
              <Calendar className="h-4 w-4 mr-2" />
              30 ngày qua
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Categories Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">📁 Danh mục phổ biến</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className={`p-4 cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br ${category.color}`}
                onClick={() => router.push(`/?petType=${category.id}`)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{category.emoji}</div>
                  <p className="font-semibold">{category.name}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trending Posts */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Bài viết nổi bật
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4" />
                  <div className="bg-gray-200 h-4 rounded mb-2" />
                  <div className="bg-gray-200 h-4 rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : trendingPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingPosts.map((post, index) => (
                <Card
                  key={post.id}
                  className="cursor-pointer hover:shadow-xl transition-all overflow-hidden group"
                  onClick={() => handlePostClick(post.slug)}
                >
                  {/* Trending Badge */}
                  {index < 3 && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        #{index + 1}
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  {post.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {post.postType && (
                        <PostTypeBadge type={post.postType} size="sm" />
                      )}
                    </div>

                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {post.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{post.city}</span>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <TagChips tags={post.tags} maxDisplay={3} size="sm" />
                    )}

                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        👁️ {post.views || 0} lượt xem
                      </span>
                      {post.reactionCount > 0 && (
                        <span className="text-red-600 font-medium">
                          ❤️ {post.reactionCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Flame className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có bài viết trending</h3>
              <p className="text-muted-foreground">
                Hãy đăng bài và tương tác nhiều để xuất hiện ở đây!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
