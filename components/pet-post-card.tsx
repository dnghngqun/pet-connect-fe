'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MapPin, 
  MessageCircle, 
  MoreVertical, 
  Flag, 
  Tag,
  Verified,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReportDialog from '@/components/report-dialog';
import PostReactions from '@/components/post-reactions';
import PostSaveButton from '@/components/post-save-button';
import PostShareButton from '@/components/post-share-button';
import PostTypeMeta from '@/components/post-type-meta';
import { useAuth } from '@/hooks/useAuth';
import type { PetPost } from '@/lib/types';
import reportService from '@/services/reportService';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface PetPostCardProps {
  post: PetPost;
  onFavoriteToggle?: (postId: string, isFavorited: boolean) => void;
  onPostClick?: (post: PetPost) => void;
}

export default function PetPostCard({ post, onFavoriteToggle, onPostClick }: PetPostCardProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reactionCount, setReactionCount] = useState(post.reactionCount || 0);
  const [favoriteCount, setFavoriteCount] = useState(post.favoriteCount || 0);
  const [isFavorited, setIsFavorited] = useState(post.isFavorited || false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleReport = async (reason: string, detail?: string) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    try {
      await reportService.createReport({
        targetId: Number(post.id),
        targetType: "POST",
        content: detail ? `${reason} - ${detail}` : reason,
      });
      toast({ title: 'Đã gửi báo cáo', description: 'Cảm ơn bạn đã phản hồi!' });
    } catch (err) {
      toast({ title: 'Không thể gửi báo cáo', variant: 'destructive' });
    } finally {
      setReportDialogOpen(false);
    }
  };

  const handleReactionChange = (newCount: number) => {
    setReactionCount(newCount);
  };

  const handleSaveChange = (saved: boolean) => {
    setIsFavorited(saved);
    setFavoriteCount(prev => saved ? prev + 1 : Math.max(0, prev - 1));
    if (onFavoriteToggle) {
      onFavoriteToggle(post.id || '', saved);
    }
  };

  // Post type configuration with colors and icons
  const postTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
    LOST_FOUND: { label: 'Lost/Found', color: 'bg-red-100 text-red-700 border-red-200', icon: '🔍' },
    ADOPTION: { label: 'Nhận nuôi', color: 'bg-green-100 text-green-700 border-green-200', icon: '🏠' },
    REVIEW: { label: 'Review', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '⭐' },
    QNA: { label: 'Hỏi đáp', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '❓' },
    TIP: { label: 'Mẹo hay', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '💡' },
    BREEDING: { label: 'Phối giống', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: '💕' },
    MARKETPLACE: { label: 'Chợ đồ', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: '🛒' },
  };

  const statusConfig = {
    lost: { label: 'Thất lạc', color: 'bg-red-500' },
    found: { label: 'Tìm thấy', color: 'bg-blue-500' },
    'for-adoption': { label: 'Cần nhà', color: 'bg-green-500' },
    rescue: { label: 'Cứu hộ', color: 'bg-orange-500' },
    general: { label: 'Bài viết', color: 'bg-slate-500' },
  };

  const typeConfig = postTypeConfig[post.postType || ''] || postTypeConfig.LOST_FOUND;
  const statusConf = statusConfig[post.status] || statusConfig.general;

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-0 bg-white">
        {/* Author Header - Facebook style */}
        <div className="p-4 flex items-center justify-between">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (post.postedBy?.id) {
                router.push(`/profile/${post.postedBy.id}`);
              }
            }}
            className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition"
          >
            <div className="relative">
              <Image
                src={post.postedBy?.avatar || '/placeholder.svg'}
                alt={post.postedBy?.name || 'User'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-1 ring-primary/20"
              />
              {post.postedBy?.isVerified && (
                <Verified className="absolute -bottom-1 -right-1 h-4 w-4 text-blue-500 fill-current bg-white rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate">{post.postedBy?.name || 'Người dùng ẩn'}</p>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setReportDialogOpen(true);
                }}
                className="text-red-600 cursor-pointer"
              >
                <Flag className="h-4 w-4 mr-2" />
                Báo cáo vi phạm
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div onClick={() => onPostClick?.(post)} className="block cursor-pointer">
          <div className="px-4 pb-3">
            {/* Phone Number if available */}
            {post.postedBy?.phone && (
              <p className="text-sm font-semibold text-blue-600 mb-2">
                📞 Liên hệ: {post.postedBy.phone}
              </p>
            )}

            <h3 className="font-semibold text-base line-clamp-2 mb-1">{post.title}</h3>
            
            {/* Description with See More */}
            <div className="relative">
              <p className={cn("text-sm text-muted-foreground whitespace-pre-line", !isExpanded && "line-clamp-3")}>
                {post.description}
              </p>
              {post.description && post.description.length > 150 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-primary text-sm font-medium hover:underline mt-1"
                >
                  {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="relative bg-muted">
            <Image
              src={post.image || '/placeholder.svg'}
              alt={post.title}
              width={600}
              height={400}
              className="w-full aspect-[4/3] object-cover"
            />
            <Badge className={`${statusConf.color} absolute top-3 left-3`}>
              {statusConf.label}
            </Badge>
          </div>

          {/* Meta info */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{post.location || `${post.district}, ${post.city}`}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {post.petType}
              </Badge>
              {post.tags?.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Post Type Specific Meta */}
          {post.postType && post.meta && (
            <div className="px-4 pb-3">
              <PostTypeMeta postType={post.postType} meta={post.meta} />
            </div>
          )}
        </div>

        {/* Stats bar */}
        {(reactionCount > 0 || favoriteCount > 0 || post.commentCount > 0) && (
          <div className="px-4 py-2 border-t border-b flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {reactionCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-red-500">❤️</span>
                  {reactionCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {post.commentCount > 0 && <span>{post.commentCount} bình luận</span>}
              {favoriteCount > 0 && <span>{favoriteCount} lượt lưu</span>}
            </div>
          </div>
        )}

        {/* Interaction Bar - Facebook style */}
        <div className="px-2 py-2 flex items-center gap-1">
          <PostReactions
            postId={post.id || ''}
            reactionCount={reactionCount}
            userReaction={post.userReaction as any}
            onReactionChange={handleReactionChange}
          />
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-blue-50 hover:text-blue-600"
            onClick={(e) => {
              e.preventDefault();
              onPostClick?.(post);
            }}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Bình luận</span>
          </Button>

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
      </Card>

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        postId={post.id}
        userId={post.postedBy?.id}
        postTitle={post.title}
        userName={post.postedBy?.name}
        onSubmit={handleReport}
      />
    </>
  );
}
