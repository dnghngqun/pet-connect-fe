'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Eye,
  Calendar,
  Tag,
  Verified,
} from 'lucide-react';
import PostReactions from '@/components/post-reactions';
import PostSaveButton from '@/components/post-save-button';
import PostShareButton from '@/components/post-share-button';
import CommentSection from '@/components/comment-section';
import type { PetPost } from '@/lib/types';
import { cn } from '@/lib/utils';
import petPostService from '@/services/petPostService';

interface PostDetailModalProps {
  post: PetPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostDetailModal({
  post,
  open,
  onOpenChange,
}: PostDetailModalProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reactionCount, setReactionCount] = useState(post.reactionCount || 0);
  const [isFavorited, setIsFavorited] = useState(post.isFavorited || false);
  const [comments, setComments] = useState<any[]>([]);
  const [fullPost, setFullPost] = useState<any>(null);

  // Get images from post.images, fallback to post.image, then to fullPost.media
  const getImages = (): string[] => {
    // Priority 1: fullPost with media array
    if (fullPost?.media && Array.isArray(fullPost.media) && fullPost.media.length > 0) {
      return fullPost.media.map((m: any) => m.imageUrl || m);
    }
    // Priority 2: fullPost with images array
    if (fullPost?.images && Array.isArray(fullPost.images) && fullPost.images.length > 0) {
      return fullPost.images;
    }
    // Priority 3: post.images array
    if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      return post.images;
    }
    // Priority 4: single post.image
    if (post.image) {
      return [post.image];
    }
    return [];
  };
  
  const images = getImages();

  // Load full post data when modal opens
  useEffect(() => {
    if (open && post.slug) {
      loadFullPost();
    }
  }, [open, post.slug]);

  const loadFullPost = async () => {
    try {
      const response = await petPostService.getPostBySlug(post.slug);
      const data = response.data || response;
      if (data) {
        setFullPost(data);
        setComments((data.comments as any)?.comments || data.comments || []);
        setReactionCount(data.reactionCount || 0);
        setIsFavorited(data.isFavorited || false);
      }
    } catch (error) {
      console.error('Failed to load full post:', error);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentImageIndex(0);
    }
  }, [open]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onOpenChange]);

  const handleReactionChange = (newCount: number) => {
    setReactionCount(newCount);
  };

  const handleSaveChange = (saved: boolean) => {
    setIsFavorited(saved);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChange(false);
    router.push(`/profile/${post.postedBy.id}`);
  };

  const handleCommentSubmit = async (content: string) => {
    await petPostService.addComment(Number(post.id), { content });
    await loadFullPost(); // Reload to get updated comments
  };

  // Post type configuration
  const postTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
    LOST_FOUND: { label: 'Lost/Found', color: 'bg-red-100 text-red-700 border-red-200', icon: '🔍' },
    ADOPTION: { label: 'Nhận nuôi', color: 'bg-green-100 text-green-700 border-green-200', icon: '🏠' },
    REVIEW: { label: 'Review', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '⭐' },
    QNA: { label: 'Hỏi đáp', color: 'bg-orange-100 text-blue-700 border-blue-200', icon: '❓' },
    TIP: { label: 'Mẹo hay', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '💡' },
    BREEDING: { label: 'Phối giống', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: '💕' },
    MARKETPLACE: { label: 'Chợ đồ', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: '🛒' },
  };

  const statusConfig = {
    lost: { label: 'Thất lạc', color: 'bg-red-500' },
    found: { label: 'Tìm thấy', color: 'bg-orange-500' },
    'for-adoption': { label: 'Cần nhà', color: 'bg-green-500' },
    rescue: { label: 'Cứu hộ', color: 'bg-orange-500' },
    general: { label: 'Bài viết', color: 'bg-slate-500' },
  };

  const typeConfig = postTypeConfig[post.postType || ''] || postTypeConfig.LOST_FOUND;
  const statusConf = statusConfig[post.status] || statusConfig.general;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{post.title}</DialogTitle>
        </VisuallyHidden>
        <div className="grid lg:grid-cols-[1fr,400px] h-full">
          {/* Left Column - Image Gallery */}
          <div className="relative bg-black flex items-center justify-center">
            {images.length > 0 && (
              <>
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={images[currentImageIndex]}
                    alt={post.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`${statusConf.color} text-white text-sm px-4 py-1.5 font-semibold shadow-lg`}>
                    {statusConf.label}
                  </Badge>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => (i === 0 ? images.length - 1 : i - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => (i === images.length - 1 ? 0 : i + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition ${
                            i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Right Column - Post Info & Comments */}
          <div className="flex flex-col bg-white overflow-hidden">
            {/* Author Header */}
            <div className="p-4 border-b">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition"
                onClick={handleAuthorClick}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.postedBy.avatar} />
                  <AvatarFallback>{post.postedBy.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{post.postedBy.name}</p>
                    {post.postedBy.isVerified && (
                      <Verified className="h-4 w-4 text-orange-500 fill-current shrink-0" />
                    )}
                    {post.postType && (
                      <Badge variant="outline" className={cn("text-xs border px-2 py-0", typeConfig.color)}>
                        <span className="mr-1">{typeConfig.icon}</span>
                        {typeConfig.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN', { 
                      day: 'numeric', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    {post.views > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.views}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Post Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Title & Description */}
                <div>
                  <h2 className="font-semibold text-lg mb-2">{post.title}</h2>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {post.description}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="space-y-2">
                  {post.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{post.location}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats Bar */}
                {(reactionCount > 0 || (post.favoriteCount || 0) > 0 || post.commentCount || 0 > 0) && (
                  <div className="py-2 border-t border-b flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {reactionCount > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="text-red-500">❤️</span>
                          {reactionCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {comments.length > 0 && <span>{comments.length} bình luận</span>}
                      {(post.favoriteCount || 0) > 0 && <span>{post.favoriteCount} lượt lưu</span>}
                    </div>
                  </div>
                )}

                {/* Interaction Buttons */}
                <div className="flex items-center gap-1 pb-4 border-b">
                  <PostReactions
                    postId={post.id || ''}
                    reactionCount={reactionCount}
                    userReaction={post.userReaction as any}
                    onReactionChange={handleReactionChange}
                  />
                  
                  <PostSaveButton
                    postId={post.id || ''}
                    isSaved={isFavorited}
                    onSaveChange={handleSaveChange}
                  />

                  <PostShareButton
                    postSlug={post.slug}
                    postTitle={post.title}
                  />
                </div>

                {/* Comments Section */}
                <CommentSection
                  postId={post.id || ''}
                  comments={comments}
                  onCommentSubmit={handleCommentSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
