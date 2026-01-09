import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/search-bar';
import { Loader2, Search as SearchIcon, Users, PawPrint, Bone, Heart, Cat, Dog, Bird, Fish, Rabbit } from 'lucide-react';
import userService from '@/services/userService';
import PetPostCard from '@/components/pet-post-card';
import PostDetailModal from '@/components/post-detail-modal';
import type { PetPost } from '@/lib/types';
import PostCardSkeleton from '@/components/post-card-skeleton';
import petPostService from '@/services/petPostService';

// Define User type to match API response
interface UserResult {
  id: number;
  fullName: string;
  avatarUrl: string;
}

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({
    posts: [],
    users: [],
    totalItems: 0,
  });

  // Modal state
  const [selectedPost, setSelectedPost] = useState<PetPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    if (query) {
      if (activeTab === 'users') {
        searchUsers(query);
      } else {
        searchPosts(query);
      }
    }
  }, [query, activeTab]);

  const searchUsers = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await userService.searchUsers(searchQuery);
      if (response && response.success) {
        setResults((prev: any) => ({
          ...prev,
          users: response.data || [],
          totalItems: response.data?.length || 0
        }));
      } else {
         setResults((prev: any) => ({
          ...prev,
          users: Array.isArray(response) ? response : [],
          totalItems: Array.isArray(response) ? response.length : 0
        }));
      }
    } catch (error) {
      console.error('User search error:', error);
      setResults((prev: any) => ({ ...prev, users: [], totalItems: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const searchPosts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const typeFilter = (activeTab !== 'all' && activeTab !== 'users') ? activeTab.toUpperCase() : undefined;
      
      const data = await petPostService.getPosts({
        q: searchQuery,
        page: 0,
        size: 20,
        type: typeFilter
      });

      if (data.success) {
        const mappedPosts = (data.data?.posts || []).map((post: any) => ({
            id: post.id?.toString() || '',
            title: post.title,
            slug: post.slug,
            description: post.description,
            image: post.images?.[0] || post.image || '',
            petType: post.petType,
            status: post.status,
            postType: post.postType,
            location: post.location || `${post.district}, ${post.city}`,
            city: post.city,
            district: post.district,
            postedBy: {
              id: post.postedBy?.id?.toString() || '',
              name: post.postedBy?.name || 'Unknown',
              phone: post.postedBy?.phone || '',
              avatar: post.postedBy?.avatar,
              isVerified: false, 
            },
            createdAt: post.createdAt,
            tags: post.tags || [],
            views: post.views || 0,
            featured: post.featured,
            reactionCount: post.reactionCount || 0,
            favoriteCount: post.favoriteCount || 0,
            commentCount: post.commentCount || 0,
            userReaction: post.userReaction || null,
            isFavorited: post.isFavorited || false,
            meta: post.meta || {},
        }));

        setResults((prev: any) => ({
          ...prev,
          posts: mappedPosts,
          totalItems: data.pagination?.totalItems || 0,
        }));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: PetPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
    
    if (post.id && /^\d+$/.test(post.id.toString())) {
       import('@/services/trendingService').then(mod => {
          mod.default.trackView(post.id.toString());
       });
    }
  };

  const handleUserClick = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen py-6 relative">
      {/* Decorative stickers */}
      <div className="absolute top-20 left-8 text-orange-200/40 animate-bounce">
        <PawPrint size={32} />
      </div>
      <div className="absolute top-40 right-12 text-amber-200/40 animate-pulse">
        <Heart size={28} />
      </div>
      <div className="absolute bottom-32 left-16 text-yellow-200/40">
        <Bone size={36} className="rotate-45" />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header with search - Glassmorphism style */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md">
              <SearchIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Tìm kiếm
              </h1>
              <p className="text-sm text-muted-foreground">Khám phá thế giới thú cưng 🐾</p>
            </div>
          </div>
          <SearchBar 
            onSearch={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
            showResults={false}
            className="max-w-2xl"
          />
        </div>

        {query && (
          <>
            {/* Results header */}
            <div className="mb-4 flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-orange-400" />
              <p className="text-muted-foreground">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tìm kiếm...
                  </span>
                ) : (
                  <>
                    Tìm thấy <span className="font-semibold text-orange-600">{results.totalItems}</span> kết quả cho{' '}
                    <span className="font-semibold text-foreground">"{query}"</span>
                  </>
                )}
              </p>
            </div>

            {/* Filter tabs - Styled */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/70 backdrop-blur-sm mb-6 p-1.5 h-auto flex-wrap rounded-xl border border-white/50 shadow-sm">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  🐾 Tất cả
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <Users className="h-4 w-4"/> Mọi người
                </TabsTrigger>
                <TabsTrigger value="lost_found" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  🔍 Thất lạc
                </TabsTrigger>
                <TabsTrigger value="adoption" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  🏠 Nhận nuôi
                </TabsTrigger>
                <TabsTrigger value="review" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  ⭐ Review
                </TabsTrigger>
                <TabsTrigger value="qna" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  ❓ Hỏi đáp
                </TabsTrigger>
                <TabsTrigger value="tip" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  💡 Mẹo hay
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  🛒 Chợ Pet
                </TabsTrigger>
              </TabsList>

              {/* Users Tab Content */}
              <TabsContent value="users">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                     <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  </div>
                ) : results.users && results.users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.users.map((user: UserResult) => (
                      <div 
                        key={user.id} 
                        onClick={() => handleUserClick(user.id)}
                        className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-4"
                      >
                         <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden flex-shrink-0 ring-2 ring-orange-200/50">
                           <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} alt={user.fullName} className="h-full w-full object-cover" />
                         </div>
                         <div className="min-w-0">
                           <h3 className="font-semibold text-gray-900 truncate">{user.fullName}</h3>
                           <p className="text-sm text-orange-500 flex items-center gap-1">
                             <PawPrint className="h-3 w-3" /> Người yêu thú cưng
                           </p>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                      <Users className="h-8 w-8 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Không tìm thấy người dùng</h3>
                    <p className="text-muted-foreground">Thử tìm với từ khóa hoặc số điện thoại khác 🐕</p>
                  </div>
                )}
              </TabsContent>

              {/* Post List Content for all other tabs */}
              {['all', 'lost_found', 'adoption', 'review', 'qna', 'tip', 'marketplace'].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue}>
                  {loading ? (
                     <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                           <PostCardSkeleton key={i} />
                        ))}
                     </div>
                  ) : results.posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {results.posts.map((post: PetPost) => (
                        <PetPostCard 
                            key={post.id} 
                            post={post} 
                            onPostClick={handlePostClick} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                        <Cat className="h-8 w-8 text-orange-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</h3>
                      <p className="text-muted-foreground mb-4">
                        Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc 🐱
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('all')}
                        className="rounded-full border-orange-200 hover:bg-orange-50"
                      >
                        <PawPrint className="h-4 w-4 mr-2" />
                        Xem tất cả kết quả
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}

        {!query && (
          <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-6">
              <SearchIcon className="h-10 w-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Tìm kiếm bài viết
            </h3>
            <p className="text-muted-foreground mb-6">
              Nhập từ khóa để tìm kiếm bài viết về thú cưng 🐾
            </p>
            <div className="flex justify-center gap-3 text-3xl">
              <span className="animate-bounce delay-100">🐕</span>
              <span className="animate-bounce delay-200">🐈</span>
              <span className="animate-bounce delay-300">🐦</span>
              <span className="animate-bounce delay-500">🐰</span>
            </div>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          open={isPostModalOpen}
          onOpenChange={setIsPostModalOpen}
        />
      )}
    </div>
  );
}

