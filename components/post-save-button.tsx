'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import petPostService from '@/services/petPostService';
import { toast } from '@/components/ui/use-toast';

interface PostSaveButtonProps {
  postId: string;
  isSaved: boolean;
  onSaveChange?: (isSaved: boolean) => void;
}

export default function PostSaveButton({
  postId,
  isSaved: initialSaved,
  onSaveChange,
}: PostSaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSave = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      const response = await petPostService.toggleFavorite(Number(postId));
      const newState = response.data?.isFavorited || false;
      
      setIsSaved(newState);

      if (onSaveChange) {
        onSaveChange(newState);
      }

      toast({
        description: newState ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết',
        duration: 2000,
      });
    } catch (error) {

      setIsSaved(previousState);
      console.error('Failed to toggle save:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu bài viết. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'gap-2 transition-all',
        isSaved && 'text-amber-600 bg-amber-50 hover:bg-amber-100',
        !isSaved && 'hover:bg-amber-50 hover:text-amber-600'
      )}
      onClick={handleToggleSave}
      disabled={isLoading}
    >
      <motion.div
        initial={false}
        animate={isSaved ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Bookmark
          className={cn('h-4 w-4 transition-all', isSaved && 'fill-current')}
        />
      </motion.div>
      <span className="text-sm font-medium">
        {isSaved ? 'Đã lưu' : 'Lưu'}
      </span>
    </Button>
  );
}
