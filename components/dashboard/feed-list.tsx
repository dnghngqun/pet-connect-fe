'use client';

import { useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';
import petPostService, { PostListItem } from '@/services/petPostService';
import PostCard from './post-card';
import PostDetailModal from './post-detail-modal';

export default function FeedList() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPost, setSelectedPost] = useState<PostListItem | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await petPostService.getPosts({ page: 0, size: 20 });
      if (response.success && response.data.posts) {
        const content = (response.data.posts as any).content || response.data.posts;
        if (Array.isArray(content)) {
             setPosts(content);
        } else {
             setPosts([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost: PostListItem) => {
    setPosts(prevPosts => 
      prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p)
    );
    // Also update selectedPost if it matches, to allow immediate reflection if we stay open?
    // Actually selectedPost is local state for modal, modal uses internal state too.
    // updating selectedPost might re-render modal.
    if (selectedPost && selectedPost.id === updatedPost.id) {
        setSelectedPost(updatedPost);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <PawPrint className="animate-spin text-[#f06e42]/50 h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{error}</p>
        <button 
          onClick={fetchPosts}
          className="mt-2 text-[#f06e42] hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <article className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <PawPrint className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-[#1b110d] dark:text-white font-bold text-lg mb-2">Chưa có bài viết nào</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Bảng tin của bạn đang trống. Hãy kết bạn hoặc tham gia các nhóm để xem thêm nội dung thú vị!
          </p>
        </div>
      </article>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onClick={() => setSelectedPost(post)}
            onPostUpdate={handlePostUpdate}
          />
        ))}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[100]">
           {/* Dynamically import or just render if imported above. 
               Since it's a client component, standard import works.
               Need to add import at top.
           */}
           <PostDetailModal 
            post={selectedPost} 
            onClose={() => setSelectedPost(null)} 
            onPostUpdate={handlePostUpdate}
           />
        </div>
      )}
    </>
  );
}

// Need to update imports but replace_file_content targets a block. 
// I will use a separate call or multi_replace to handle imports if needed.
// Actually, I can just use multi_replace to handle both imports and the body.

