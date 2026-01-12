'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, X } from 'lucide-react';
import authService from '@/services/authService';
import petPostService from '@/services/petPostService';
import { cn } from '@/lib/utils';
import CommentItem from './comment-item';

interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  depth: number;
  likes: number;
  createdAt: string;
  replyCount: number;
  replies?: Comment[];
  parentCommentId?: number;
}

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
  className?: string;
}

export default function CommentSection({ 
  postId, 
  initialComments = [],
  className 
}: CommentSectionProps) {
  const router = useRouter();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialComments.length === 0) {
      loadComments();
    } else {
      setComments(initialComments);
    }
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await petPostService.getComments(Number(postId));
      if (response.success) {
        setComments(response.data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (parentCommentId: number) => {
    try {
      // Backend already includes replies in the comment response
      // But if we need to load them separately:
      const response = await petPostService.getReplies(parentCommentId);
      if (response.success) {
        setComments(prev => prev.map(comment => 
          comment.id === parentCommentId
            ? { ...comment, replies: response.data.comments }
            : comment
        ));
      }
    } catch (error) {
      console.error('Failed to load replies:', error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const requestData = {
        content: commentText,
        parentCommentId: replyingTo?.id || undefined,
      };

      const response = await petPostService.addComment(Number(postId), requestData);
      
      if (response.success) {
        const newComment = response.data;
        
        if (replyingTo) {
          // Add as reply to parent comment
          setComments(prev => prev.map(comment => {
            if (comment.id === replyingTo.id) {
              return {
                ...comment,
                replyCount: comment.replyCount + 1,
                replies: [...(comment.replies || []), newComment]
              };
            }
            return comment;
          }));
        } else {
          // Add as top-level comment
          setComments(prev => [newComment, ...prev]);
        }
        
        setCommentText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: number, userName: string) => {
    setReplyingTo({ id: commentId, name: userName });
    // Focus on textarea
    document.querySelector<HTMLTextAreaElement>('textarea')?.focus();
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Comment List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLoadReplies={loadReplies}
              showReplies={false}
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Chưa có bình luận nào.</p>
            <p className="text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="border-t pt-3 mt-3 bg-background sticky bottom-0">
        {replyingTo && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-50 rounded-lg text-sm">
            <span className="text-gray-600">Đang trả lời</span>
            <span className="font-semibold text-orange-500">{replyingTo.name}</span>
            <button
              onClick={() => setReplyingTo(null)}
              className="ml-auto p-1 hover:bg-orange-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={authService.getCurrentUser()?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400/20 to-purple-500/20 text-xs">
              {authService.getCurrentUser()?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder={replyingTo ? `Trả lời ${replyingTo.name}...` : "Viết bình luận..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[42px] max-h-32 resize-none rounded-full px-4 py-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isSubmitting || !commentText.trim()}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
