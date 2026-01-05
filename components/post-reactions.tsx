'use client';

import { useState } from 'react';
import { Heart, ThumbsUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import petPostService from '@/services/petPostService';
import { toast } from '@/components/ui/use-toast';

type ReactionType = 'LIKE' | 'LOVE' | 'CARE' | null;

interface PostReactionsProps {
  postId: string;
  reactionCount: number;
  userReaction: ReactionType;
  onReactionChange?: (newCount: number, newReaction: ReactionType) => void;
}

const REACTIONS = [
  {
    type: 'LIKE' as const,
    icon: ThumbsUp,
    label: 'Thích',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
  },
  {
    type: 'LOVE' as const,
    icon: Heart,
    label: 'Yêu thích',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:bg-red-100',
  },
  {
    type: 'CARE' as const,
    icon: Sparkles,
    label: 'Quan tâm',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100',
  },
];

export default function PostReactions({
  postId,
  reactionCount: initialCount,
  userReaction: initialReaction,
  onReactionChange,
}: PostReactionsProps) {
  const [reactionCount, setReactionCount] = useState(initialCount || 0);
  const [userReaction, setUserReaction] = useState<ReactionType>(initialReaction);
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = async (type: ReactionType) => {
    if (isLoading) return;

    setIsLoading(true);
    setShowPicker(false);

    try {
      const response = await petPostService.reactToPost(Number(postId), type || 'LIKE');
      
      const newReaction = response.data?.reaction || null;
      const newCount = response.data?.reactionCount || 0;

      setUserReaction(newReaction as ReactionType);
      setReactionCount(newCount);

      if (onReactionChange) {
        onReactionChange(newCount, newReaction as ReactionType);
      }

      // Show toast only when adding a new reaction (not removing)
      if (newReaction) {
        const reactionLabel = REACTIONS.find(r => r.type === newReaction)?.label || 'Thích';
        toast({
          description: `Đã ${reactionLabel.toLowerCase()} bài viết`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to react:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật cảm xúc. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentReaction = REACTIONS.find((r) => r.type === userReaction);
  const ReactionIcon = currentReaction?.icon || ThumbsUp;

  return (
    <div className="flex items-center gap-2">
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-2 transition-all',
              userReaction && currentReaction?.color,
              userReaction && currentReaction?.bgColor,
              !userReaction && 'hover:bg-blue-50 hover:text-blue-600'
            )}
            onClick={() => !userReaction && handleReaction('LIKE')}
            onMouseEnter={() => setShowPicker(true)}
            disabled={isLoading}
          >
            <motion.div
              initial={false}
              animate={userReaction ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ReactionIcon className={cn('h-4 w-4', userReaction && currentReaction?.color)} />
            </motion.div>
            <span className="text-sm font-medium">
              {currentReaction?.label || 'Thích'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2" 
          align="start"
          onMouseLeave={() => setShowPicker(false)}
        >
          <div className="flex gap-2">
            <AnimatePresence>
              {REACTIONS.map((reaction, index) => {
                const Icon = reaction.icon;
                return (
                  <motion.button
                    key={reaction.type}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(reaction.type)}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      reaction.hoverColor,
                      userReaction === reaction.type && reaction.bgColor
                    )}
                    title={reaction.label}
                  >
                    <Icon className={cn('h-6 w-6', reaction.color)} />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </PopoverContent>
      </Popover>

      {reactionCount > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {reactionCount}
        </span>
      )}
    </div>
  );
}
