'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/search-bar';
import PostTypeBadge from '@/components/post-type-badge';
import TagChips from '@/components/tag-chips';
import { Loader2, Search as SearchIcon } from 'lucide-react';

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>({
    posts: [],
    totalItems: 0,
  });

  useEffect(() => {
    if (query) {
      searchPosts(query);
    }
  }, [query, activeTab]);

  const searchPosts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: '0',
        size: '20',
      });

      // Add filter based on active tab
      if (activeTab !== 'all') {
        params.append('type', activeTab.toUpperCase());
      }

      const response = await fetch(`/api/v1/posts?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults({
          posts: data.data?.posts || [],
          totalItems: data.pagination?.totalItems || 0,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (slug: string) => {
    router.push(`/pet/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            <SearchIcon className="inline-block mr-2 h-6 w-6" />
            Tìm kiếm
          </h1>
          <SearchBar 
            onSearch={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
            showResults={false}
            className="max-w-2xl"
          />
        </div>

        {query && (
          <>
            {/* Results header */}
            <div className="mb-4">
              <p className="text-muted-foreground">
                {loading ? (
                  'Đang tìm kiếm...'
                ) : (
                  <>
                    Tìm thấy <span className="font-semibold text-foreground">{results.totalItems}</span> kết quả cho{' '}
                    <span className="font-semibold text-foreground">"{query}"</span>
                  </>
                )}
              </p>
            </div>

            {/* Filter tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white mb-6">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="lost_found">🔍 Thất lạc</TabsTrigger>
                <TabsTrigger value="adoption">🏠 Nhận nuôi</TabsTrigger>
                <TabsTrigger value="review">⭐ Review</TabsTrigger>
                <TabsTrigger value="qna">❓ Hỏi đáp</TabsTrigger>
                <TabsTrigger value="tip">💡 Mẹo hay</TabsTrigger>
                <TabsTrigger value="marketplace">🛒 Chợ Pet</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : results.posts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {results.posts.map((post: any) => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post.slug)}
                        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-4"
                      >
                        <div className="flex gap-4">
                          {post.image && (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
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
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{post.city}</span>
                              <span>•</span>
                              <span>{post.petType}</span>
                              {post.views > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{post.views} lượt xem</span>
                                </>
                              )}
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="mt-2">
                                <TagChips tags={post.tags} maxDisplay={5} size="sm" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</h3>
                    <p className="text-muted-foreground mb-4">
                      Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('all')}
                    >
                      Xem tất cả kết quả
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {!query && (
          <div className="text-center py-12 bg-white rounded-lg">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tìm kiếm bài viết</h3>
            <p className="text-muted-foreground">
              Nhập từ khóa để tìm kiếm bài viết về thú cưng
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
