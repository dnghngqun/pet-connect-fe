'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Loader2, PawPrint, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PetPostCard from '@/components/pet-post-card';
import petPostService, { PostListItem } from '@/services/petPostService';
import { Button } from '@/components/ui/button';

export default function SavedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const response = await petPostService.getFavoritePosts({ page: 0, size: 20 });
      if (response && response.data && response.data.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: any) => {
    router.push(`/pet/${post.slug}`);
  };

  return (
    <div className="min-h-screen py-6 relative">
      
      <div className="absolute top-24 right-10 text-orange-200/30 animate-pulse">
        <Bookmark size={40} />
      </div>
      <div className="absolute bottom-20 left-8 text-amber-200/30">
        <PawPrint size={32} className="rotate-12" />
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-md">
              <Bookmark className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Bài viết đã lưu
              </h1>
              <p className="text-sm text-muted-foreground">Những bài viết bạn muốn xem lại 📚</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PetPostCard 
                key={post.id} 
                post={{
                    pet: post.pet ? { ...post.pet, id: post.pet.id.toString() } : undefined,
                    id: post.id.toString(),
                    image: post.image || '',
                    status: post.status as any,
                    postedBy: {
                        ...post.postedBy,
                        id: post.postedBy.id.toString(),
                        avatar: post.postedBy.avatar || undefined, 
                        isVerified: false
                    },
                    location: post.location || `${post.district}, ${post.city}`,
                    reactionCount: post.reactionCount || 0,
                    favoriteCount: post.favoriteCount || 0,
                    commentCount: post.commentCount || 0,
                    userReaction: null,
                    isFavorited: true
                }} 
                onPostClick={handlePostClick} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
              <Bookmark className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chưa có bài viết nào được lưu</h3>
            <p className="text-muted-foreground mb-6">Hãy lưu lại những bài viết thú vị để xem lại sau nhé! 🐾</p>
            <Button 
              onClick={() => router.push('/')}
              className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <PawPrint className="h-4 w-4 mr-2" />
              Khám phá ngay
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
