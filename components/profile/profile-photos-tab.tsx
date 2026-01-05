'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { getUserPosts } from '@/services/userService';

interface ProfilePhotosTabProps {
  userId: string;
}

export default function ProfilePhotosTab({ userId }: ProfilePhotosTabProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPhotos = async (pageNum: number) => {
    try {
      setLoading(true);
      // Fetch posts (we might need to fetch more to find photos if posts are text-only)
      const response = await getUserPosts(userId, pageNum, 20);
      
      if (response.success && response.data?.posts) {
        // Extract posts with images
        const postsWithImages = response.data.posts.filter((post: any) => post.image);
        
        if (pageNum === 0) {
          setPhotos(postsWithImages);
        } else {
          setPhotos(prev => [...prev, ...postsWithImages]);
        }
        
        // If response has fewer items than requested, we reached end
        if (response.data.posts.length < 20) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPhotos(0);
  }, [userId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPhotos(nextPage);
  };

  if (loading && photos.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <p>Người dùng này chưa có ảnh nào.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Ảnh</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {photos.map((post) => (
          <Link key={post.id} href={`/pet/${post.slug}`} className="block group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
             <img 
               src={post.image} 
               alt={post.title} 
               className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
             />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300" />
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Xem thêm
          </Button>
        </div>
      )}
    </Card>
  );
}
