'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PetPostCard from '@/components/pet-post-card';
import PostCardSkeleton from '@/components/post-card-skeleton';
import CreatePostModal from '@/components/create-post-modal';
import PostDetailModal from '@/components/post-detail-modal';

import { Button } from '@/components/ui/button';
import { Home, Heart, Bookmark, TrendingUp, Loader2 } from 'lucide-react';
import petPostService from '@/services/petPostService';
import suggestionsService, { SuggestedItem, SuggestionsData } from '@/services/suggestionsService';
import friendRequestService from '@/services/friendRequestService';
import authService from '@/services/authService';
import type { PetPost } from '@/lib/types';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function FeedPage() {
  const [mounted, setMounted] = useState(false);
  const user = typeof window !== 'undefined' ? authService.getCurrentUser() : null;
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [postTypeFilter, setPostTypeFilter] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const router = useRouter();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PetPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsData>({ organizations: [], users: [], groups: [] });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [trendingTags, setTrendingTags] = useState<import('@/services/trendingService').TrendingStats[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null); // For edit mode

  const handlePostCreated = (newPostData: any) => {
    const imageUrl =
      newPostData.image ||
      newPostData.media?.[0]?.imageUrl ||
      newPostData.images?.[0] ||
      '';
    const newPost: PetPost = {
      id: newPostData.id?.toString() || Date.now().toString(),
      title: newPostData.title,
      slug: newPostData.slug || '',
      description: newPostData.description,
      image: imageUrl,
      petType: newPostData.petType,
      status: newPostData.status,
      postType: newPostData.postType,
      location: newPostData.location || '',
      city: newPostData.city,
      district: newPostData.district,
      postedBy: {
        id: user?.id || '',
        name: user?.fullName || 'Bạn',
        phone: '',
        avatar: user?.avatarUrl,
        isVerified: false,
      },
      createdAt: new Date().toISOString(),
      tags: newPostData.tags || [],
      views: 0,
      featured: false,
      reactionCount: 0,
      favoriteCount: 0,
      commentCount: 0,
      userReaction: null,
      isFavorited: false,
      meta: newPostData.meta || {},
    };
    setPosts(prev => [newPost, ...prev]);
    toast.success('🎉 Đã đăng bài thành công!');
  };

  const handlePostClick = (clickedPost: PetPost) => {
    setSelectedPost(clickedPost);
    setIsPostModalOpen(true);
    // Track view for trending
    if (clickedPost.id && /^\d+$/.test(clickedPost.id.toString())) {
       import('@/services/trendingService').then(mod => {
          mod.default.trackView(clickedPost.id.toString());
       });
    }
  };

  const handleTrendingClick = async (tag: string) => {
      // Track search
      const trendingService = (await import('@/services/trendingService')).default;
      await trendingService.trackSearch(tag);
      router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  const handleEditPost = async (post: PetPost) => {
    try {
      // Fetch full post detail for editing
      const response = await petPostService.getPostBySlug(post.id?.toString() || post.slug);
      if (response.success && response.data) {
        setEditingPost(response.data);
        setOpenCreateModal(true);
      } else {
        toast.error('Không thể tải thông tin bài đăng');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải bài đăng');
    }
  };

  const handleDeletePost = async (post: PetPost) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này không?')) {
      return;
    }
    try {
      const response = await petPostService.deletePost(Number(post.id));
      if (response.success) {
        // Remove the post from the list
        setPosts(prev => prev.filter(p => p.id?.toString() !== post.id?.toString()));
        toast.success('🗑️ Đã xóa bài đăng thành công!');
      } else {
        toast.error('Không thể xóa bài đăng');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa bài đăng');
    }
  };

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page]);

  useEffect(() => {
    loadPosts();
  }, [page, postTypeFilter]);

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  }, [postTypeFilter]);

  // Load suggestions and trending on mount
  useEffect(() => {
    loadSuggestions();
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setLoadingTrending(true);
    try {
      const trendingService = (await import('@/services/trendingService')).default;
      const response = await trendingService.getTrending(5);
      if (response.success) {
        setTrendingTags(response.data);
      }
    } catch (error) {
      console.error('Failed to load trending:', error);
    } finally {
      setLoadingTrending(false);
    }
  };

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await suggestionsService.getSuggestions(5);
      if (response.success) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleFollow = async (item: SuggestedItem) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    
    // Prevent double-click
    if (processingIds.has(item.id)) {
      return;
    }
    
    setProcessingIds(prev => new Set(prev).add(item.id));
    
    try {
      if (item.type === 'ORGANIZATION') {
        const response = await suggestionsService.toggleFollowOrganization(item.id);
        if (response.success) {
          setFollowingIds(prev => {
            const next = new Set(prev);
            if (response.data.isFollowing) {
              next.add(item.id);
              toast.success(`Đã theo dõi ${item.name}`);
            } else {
              next.delete(item.id);
              toast.success(`Đã bỏ theo dõi ${item.name}`);
            }
            return next;
          });
        }
      } else if (item.type === 'GROUP') {
        const response = await suggestionsService.joinGroup(item.id);
        if (response.success) {
            setFollowingIds(prev => {
            const next = new Set(prev);
            next.add(item.id);
            return next;
            });
            toast.success(`Đã gửi yêu cầu vào nhóm ${item.name}`);
        }
      } else if (item.type === 'USER') {
        const response = await friendRequestService.sendFriendRequest(item.id);
        if (response.success) {
            setFollowingIds(prev => {
            const next = new Set(prev);
            next.add(item.id);
            return next;
            });
            toast.success(`Đã gửi lời mời kết bạn tới ${item.name}`);
        }
      }
    } catch (error) {
      toast.error('Thao tác thất bại');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const loadPosts = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await petPostService.getPosts({
        page,
        size: 10,
        sort: '-createdAt',
        ...(postTypeFilter && { type: postTypeFilter }),
      });

      const newPosts = response.data.posts.map((post: any) => ({
        id: post.id?.toString() || '',
        title: post.title,
        slug: post.slug,
        description: post.description,
        image: post.images?.[0] || post.image || '',
        images: post.images || (post.image ? [post.image] : []), // Add images array for grid display
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
          isVerified: false, // postedBy doesn't have isVerified field
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

      setPosts(prev => page === 0 ? newPosts : [...prev, ...newPosts]);
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen">
      {/* Main Layout - 3 Columns */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-4 px-4 py-4">
          {/* Left Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block col-span-3 space-y-2 sticky top-20 h-fit">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Menu</h3>
              <div className="space-y-1">
                {[
                  { icon: Home, label: 'Trang chủ', href: '/' },
                  { icon: Heart, label: 'Đã thích', href: '/liked' },
                  { icon: Bookmark, label: 'Đã lưu', href: '/saved' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <item.icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">🎯 Khám phá</h3>
              <p className="text-sm text-gray-600 mb-3">
                Tìm những người bạn yêu thú cưng gần bạn
              </p>
              <Button size="sm" className="w-full">Xem ngay</Button>
            </div>
          </aside>

          {/* Center Feed */}
          <main className="col-span-12 lg:col-span-6 space-y-4">
            {/* Create Post Box */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {mounted && user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20" />
                  )}
                </div>
                <button
                  onClick={() => setOpenCreateModal(true)}
                  className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  Bạn đang nghĩ gì?
                </button>
              </div>
            </div>

            {/* Post Type Filters */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setPostTypeFilter('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    postTypeFilter === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                {[
                  { value: 'LOST_FOUND', label: '🔍 Thất lạc', color: 'red' },
                  { value: 'ADOPTION', label: '🏠 Nhận nuôi', color: 'green' },
                  { value: 'REVIEW', label: '⭐ Review', color: 'purple' },
                  { value: 'QNA', label: '❓ Hỏi đáp', color: 'blue' },
                  { value: 'TIP', label: '💡 Mẹo hay', color: 'amber' },
                  { value: 'MARKETPLACE', label: '🛒 Chợ đồ', color: 'cyan' },
                  { value: 'BREEDING', label: '💕 Phối giống', color: 'pink' },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setPostTypeFilter(filter.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      postTypeFilter === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            {loading && posts.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    ref={index === posts.length - 1 ? lastPostRef : null}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PetPostCard 
                      post={post} 
                      onPostClick={handlePostClick} 
                      onEditClick={handleEditPost}
                      onDeleteClick={handleDeletePost}
                    />
                  </motion.div>
                ))}
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
                  </div>
                )}
                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    🎉 Bạn đã xem hết rồi!
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar - Hidden on mobile/tablet */}
          <aside className="hidden xl:block col-span-3 space-y-4 sticky top-20 h-fit">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3">📢 Gợi ý cho bạn</h3>
              <div className="space-y-3">
                {loadingSuggestions ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  [...suggestions.users, ...suggestions.groups]
                    .slice(0, 5)
                    .map((item, i) => (
                      <div 
                        key={`${item.type}-${item.id}`} 
                        className={`flex items-center gap-3 p-2 -mx-2 rounded-lg transition-colors ${
                          item.type === 'USER' ? 'cursor-pointer hover:bg-gray-50' : ''
                        }`}
                        onClick={() => {
                          if (item.type === 'USER') {
                            router.push(`/profile/${item.id}`);
                          }
                        }}
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 overflow-hidden flex-shrink-0">
                          {item.avatar && (
                            <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            {item.isVerified && <span className="text-blue-500 flex-shrink-0">✓</span>}
                          </div>
                          <p className="text-xs text-gray-500">{item.tag}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={followingIds.has(item.id) ? "secondary" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollow(item);
                          }}
                          disabled={processingIds.has(item.id)}
                        >
                          {processingIds.has(item.id) ? '...' : (
                            followingIds.has(item.id) ? 
                              (item.type === 'GROUP' ? 'Đã xin vào' : item.type === 'USER' ? 'Đã gửi lời mời' : 'Đang theo dõi') 
                              : (item.type === 'GROUP' ? 'Xin vào nhóm' : item.type === 'USER' ? 'Kết bạn' : 'Theo dõi')
                          )}
                        </Button>
                      </div>
                    ))
                )}
                {!loadingSuggestions && suggestions.organizations.length === 0 && 
                  suggestions.users.length === 0 && suggestions.groups.length === 0 && (
                  <div className="text-center py-4 px-2 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                    <p className="text-sm font-medium">Chưa có gợi ý nào</p>
                    <p className="text-xs mt-1 text-gray-400">Hãy theo dõi thêm các tổ chức hoặc tham gia nhóm để nhận gợi ý phù hợp.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3">🔥 Trending</h3>
              <div className="space-y-2">
                {loadingTrending ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : trendingTags.length > 0 ? (
                  trendingTags.map((item, i) => (
                    <button 
                      key={item.id} 
                      onClick={() => handleTrendingClick(item.hashtag)}
                      className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex justify-between items-center">
                        <p className={`text-sm font-medium ${i < 3 ? 'text-blue-600' : 'text-gray-700'} group-hover:underline`}>
                          {item.hashtag}
                        </p>
                        <span className="text-xs text-gray-400">#{i + 1}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.postCount > 0 ? `${item.postCount} bài viết` : ''}
                        {(item.searchCount + item.viewCount) > 0 ? `${item.postCount > 0 ? ' • ' : ''}${item.searchCount + item.viewCount} quan tâm` : (item.postCount === 0 ? 'Mới nổi' : '')}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">Chưa có xu hướng nào</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Create/Edit Post Modal */}
      <CreatePostModal
        open={openCreateModal}
        onOpenChange={(open) => {
          setOpenCreateModal(open);
          if (!open) setEditingPost(null); // Reset editing state when modal closes
        }}
        onPostCreated={(post) => {
          if (editingPost) {
            // Reload posts to get fresh data after update
            setPosts([]);
            setPage(0);
            setHasMore(true);
            toast.success('🎉 Đã cập nhật bài đăng thành công!');
          } else {
            handlePostCreated(post);
          }
          setEditingPost(null);
        }}
        initialPost={editingPost}
      />

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
