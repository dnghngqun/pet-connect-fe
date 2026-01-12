import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, Flag, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import petPostService from '@/services/petPostService';

interface PostActionBarProps {
  postId: number;
  initialLiked?: boolean;
  initialSaved?: boolean;
  initialReactionCount?: number;
  initialCommentCount?: number;
  onCommentClick?: () => void;
  onReportClick?: () => void;
  showCounts?: boolean;
}

export default function PostActionBar({
  postId,
  initialLiked = false,
  initialSaved = false,
  initialReactionCount = 0,
  initialCommentCount = 0,
  onCommentClick,
  onReportClick,
  showCounts = true,
}: PostActionBarProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [reactionCount, setReactionCount] = useState(initialReactionCount);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLike = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const optimisticLiked = !liked;
    const optimisticCount = reactionCount + (optimisticLiked ? 1 : -1);
    
    // Optimistic update
    setLiked(optimisticLiked);
    setReactionCount(optimisticCount);

    try {
      const response = await petPostService.reactToPost(postId, 'LIKE');
      
      // Update with server response
      setLiked(response.reaction !== null);
      setReactionCount(response.reactionCount || 0);
      
      toast({
        title: optimisticLiked ? '❤️ Đã thích!' : 'Đã bỏ thích',
        duration: 1500,
      });
    } catch (error) {
      // Revert on error
      setLiked(initialLiked);
      setReactionCount(initialReactionCount);
      
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const optimisticSaved = !saved;
    
    // Optimistic update
    setSaved(optimisticSaved);

    try {
      const response = await petPostService.toggleFavorite(postId);
      
      // Update with server response
      setSaved(response.isFavorited);
      
      toast({
        title: optimisticSaved ? '🔖 Đã lưu!' : 'Đã bỏ lưu',
        duration: 1500,
      });
    } catch (error) {
      // Revert on error
      setSaved(initialSaved);
      
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/pet/${postId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: '📤 Đã sao chép liên kết!',
        description: 'Bạn có thể chia sẻ bài viết này',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Không thể sao chép',
        description: 'Vui lòng thử lại',
        variant: 'destructive',
      });
    }
  };

  const handleReport = () => {
    if (onReportClick) {
      onReportClick();
    } else {
      toast({
        title: '🚩 Báo cáo bài viết',
        description: 'Chức năng đang được phát triển',
      });
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t">
      {/* Left side - Main actions */}
      <div className="flex items-center gap-1">
        {/* Like button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isProcessing}
          className={`gap-2 ${liked ? 'text-red-600 hover:text-red-700' : 'hover:text-red-600'}`}
        >
          <Heart 
            className={`h-5 w-5 transition-all ${liked ? 'fill-red-600' : ''}`}
          />
          {showCounts && reactionCount > 0 && (
            <span className="text-sm font-medium">{reactionCount}</span>
          )}
        </Button>

        {/* Comment button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentClick}
          className="gap-2 hover:text-orange-500"
        >
          <MessageCircle className="h-5 w-5" />
          {showCounts && initialCommentCount > 0 && (
            <span className="text-sm font-medium">{initialCommentCount}</span>
          )}
        </Button>

        {/* Share button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="gap-2 hover:text-green-600"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Right side - Save & More */}
      <div className="flex items-center gap-1">
        {/* Save button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={isProcessing}
          className={`gap-2 ${saved ? 'text-orange-500 hover:text-blue-700' : 'hover:text-orange-500'}`}
        >
          <Bookmark 
            className={`h-5 w-5 transition-all ${saved ? 'fill-orange-500' : ''}`}
          />
        </Button>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleReport} className="text-red-600">
              <Flag className="h-4 w-4 mr-2" />
              Báo cáo bài viết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
