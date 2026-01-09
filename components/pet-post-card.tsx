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
  onEditClick?: (post: PetPost) => void;
  onDeleteClick?: (post: PetPost) => void;
}

export default function PetPostCard({ post, onFavoriteToggle, onPostClick, onEditClick, onDeleteClick }: PetPostCardProps) {
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
              {(user?.id?.toString() === post.postedBy?.id?.toString() || user?._id?.toString() === post.postedBy?.id?.toString()) && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEditClick?.(post);
                    }}
                    className="cursor-pointer"
                  >
                    <span className="flex items-center">
                      <svg className="mr-2 h-4 w-4" xmlns="http:
                      Sửa bài đăng
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteClick?.(post);
                    }}
                    className="text-red-600 cursor-pointer"
                  >
                    <span className="flex items-center">
                      <svg className="mr-2 h-4 w-4" xmlns="http:
                      Xóa bài đăng
                    </span>
                  </DropdownMenuItem>
                </>
              )}
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

        
        <div onClick={() => onPostClick?.(post)} className="block cursor-pointer">
          <div className="px-4 pb-3">
            
            {post.postedBy?.phone && (
              <p className="text-sm font-semibold text-blue-600 mb-2">
                📞 Liên hệ: {post.postedBy.phone}
              </p>
            )}

            <h3 className="font-semibold text-base line-clamp-2 mb-1">{post.title}</h3>
            
            
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

          
          <div className="relative bg-muted">
            {(() => {
              const images = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
              const count = images.length;

              if (count === 0) {
                 return (
                   <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-100">
                     <Image src="/placeholder.svg" alt="Placeholder" width={600} height={400} className="w-full h-full object-cover opacity-50" />
                   </div>
                 );
              }
              if (count === 1) {
                return (
                  <Image
                    src={images[0]}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="w-full aspect-[4/3] object-cover"
                  />
                );
              }
              if (count === 2) {
                return (
                  <div className="grid grid-cols-2 gap-1 aspect-[4/3]">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-full h-full">
                         <Image src={img} alt={`${post.title} ${idx+1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                );
              }
              if (count === 3) {
                 return (
                   <div className="grid grid-cols-2 gap-1 aspect-[4/3]">
                     <div className="relative w-full h-full">
                       <Image src={images[0]} alt={`${post.title} 1`} fill className="object-cover" />
                     </div>
                     <div className="grid grid-rows-2 gap-1 h-full">
                       <div className="relative w-full h-full">
                         <Image src={images[1]} alt={`${post.title} 2`} fill className="object-cover" />
                       </div>
                       <div className="relative w-full h-full">
                         <Image src={images[2]} alt={`${post.title} 3`} fill className="object-cover" />
                       </div>
                     </div>
                   </div>
                 );
              }
              if (count === 4) {
                return (
                  <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-[4/3]">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-full h-full">
                         <Image src={img} alt={`${post.title} ${idx+1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-2 gap-1 aspect-[4/3]">
                  <div className="relative w-full h-full">
                    <Image src={images[0]} alt={`${post.title} 1`} fill className="object-cover" />
                  </div>
                  <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                    <div className="relative w-full h-full col-span-2">
                       <Image src={images[1]} alt={`${post.title} 2`} fill className="object-cover" />
                    </div>
                    <div className="relative w-full h-full">
                       <Image src={images[2]} alt={`${post.title} 3`} fill className="object-cover" />
                    </div>
                    <div className="relative w-full h-full">
                       <Image src={images[3]} alt={`${post.title} 4`} fill className="object-cover" />
                       {count > 4 && (
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                           +{count - 4}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <Badge className={`${statusConf.color} absolute top-3 left-3 z-10`}>
              {statusConf.label}
            </Badge>
          </div>

          
          <div className="px-4 py-3 space-y-2">
            
            {((post.location && !post.location.includes('null')) || (post.city && !post.city.includes('null') && post.city !== 'Online')) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="line-clamp-1">
                  {post.location && !post.location.includes('null') 
                    ? post.location 
                    : `${post.city && !post.city.includes('null') ? post.city : ''}${
                        post.district && !post.district.includes('null') ? `, ${post.district}` : ''
                      }`}
                </span>
              </div>
            )}
            
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

          
          {post.postType && post.meta && (
            <div className="px-4 pb-3">
              <PostTypeMeta postType={post.postType} meta={post.meta} />
            </div>
          )}
        </div>

        
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
