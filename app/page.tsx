'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PetPostCard from '@/components/pet-post-card';
import PostCardSkeleton from '@/components/post-card-skeleton';
import CreatePostModal from '@/components/create-post-modal';
import PostDetailModal from '@/components/post-detail-modal';
import { Button } from '@/components/ui/button';
import { Home, Heart, Bookmark, TrendingUp } from 'lucide-react';
import petPostService from '@/services/petPostService';
import authService from '@/services/authService';
import type { PetPost } from '@/lib/types';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function FeedPage() {
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [postTypeFilter, setPostTypeFilter] = useState<string>('');
  const user = typeof window !== 'undefined' ? authService.getCurrentUser() : null;
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PetPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handlePostCreated = (newPostData: any) => {
    const newPost: PetPost = {
      id: newPostData.id?.toString() || Date.now().toString(),
      title: newPostData.title,
      slug: newPostData.slug || '',
      description: newPostData.description,
      image: newPostData.images?.[0] || '',
      petType: newPostData.petType,
      status: newPostData.status,
      postType: newPostData.postType,
      location: newPostData.location || '',
      city: newPostData.city,
      district: newPostData.district,
      postedBy: {
        id: user?._id || '',
        name: user?.name || 'Bạn',
        phone: '',
        avatar: user?.avatar,
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
  }, [page]);

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  }, [postTypeFilter]);

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
    <div className="min-h-screen bg-gray-50">
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
                  { icon: TrendingUp, label: 'Thịnh hành', href: '/trending' },
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
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
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
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setOpenCreateModal(true)}>
                  🔍 Thất lạc
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setOpenCreateModal(true)}>
                  🏠 Nhận nuôi
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setOpenCreateModal(true)}>
                  ⭐ Review
                </Button>
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
                    <PetPostCard post={post} onPostClick={handlePostClick} />
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
                {[
                  { name: 'Trung Tâm Cứu Hộ ABC', tag: 'Tổ chức', verified: true },
                  { name: 'BS. Nguyễn Văn A', tag: 'Bác sĩ thú y', verified: true },
                  { name: 'Cộng Đồng Yêu Chó', tag: 'Nhóm', verified: false },
                ].map((suggestion, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium truncate">{suggestion.name}</p>
                        {suggestion.verified && <span className="text-blue-500">✓</span>}
                      </div>
                      <p className="text-xs text-gray-500">{suggestion.tag}</p>
                    </div>
                    <Button size="sm" variant="outline">Theo dõi</Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3">🔥 Trending</h3>
              <div className="space-y-2">
                {['#HuskyThatlac', '#NhanNuoiChoMeo', '#ReviewPhongKham', '#MeoDeThg'].map((tag, i) => {
                  const postCounts = [847, 563, 421, 315, 289];
                  return (
                    <button key={i} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="text-sm font-medium text-blue-600">{tag}</p>
                      <p className="text-xs text-gray-500">{postCounts[i] || 150} bài viết</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={openCreateModal}
        onOpenChange={setOpenCreateModal}
        onPostCreated={handlePostCreated}
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
