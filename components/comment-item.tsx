import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

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
}

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: number, userName: string) => void;
  onLoadReplies?: (commentId: number) => void;
  showReplies?: boolean;
}

export default function CommentItem({ 
  comment, 
  onReply, 
  onLoadReplies,
  showReplies = false 
}: CommentItemProps) {
  const router = useRouter();
  const [repliesVisible, setRepliesVisible] = useState(showReplies);
  const [liked, setLiked] = useState(false);

  const handleReplyClick = () => {
    onReply(comment.id, comment.userName);
  };

  const handleToggleReplies = () => {
    if (!repliesVisible && onLoadReplies && comment.replyCount > 0) {
      onLoadReplies(comment.id);
    }
    setRepliesVisible(!repliesVisible);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${comment.userId}`);
  };

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div className={`${comment.depth > 0 ? 'ml-12' : ''}`}>
      <div className="flex gap-2 group">
        {/* Avatar */}
        <div 
          className="flex-shrink-0 cursor-pointer hover:opacity-80 transition"
          onClick={handleAvatarClick}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.userAvatar} alt={comment.userName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400/20 to-purple-500/20 text-xs">
              {comment.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
            <div 
              className="font-semibold text-sm hover:underline cursor-pointer"
              onClick={handleAvatarClick}
            >
              {comment.userName}
            </div>
            <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-1 px-3 text-xs text-gray-500">
            <button
              onClick={() => setLiked(!liked)}
              className={`font-semibold hover:underline transition ${
                liked ? 'text-red-500' : ''
              }`}
            >
              Thích {comment.likes > 0 && `(${comment.likes})`}
            </button>

            {/* Only show Reply button for top-level comments (depth 0) */}
            {comment.depth === 0 && (
              <button
                onClick={handleReplyClick}
                className="font-semibold hover:underline"
              >
                Trả lời
              </button>
            )}

            <span className="text-gray-400">{timeAgo}</span>
          </div>

          {/* Show Replies Toggle (only for top-level comments with replies) */}
          {comment.depth === 0 && comment.replyCount > 0 && (
            <button
              onClick={handleToggleReplies}
              className="flex items-center gap-1 mt-2 px-3 text-xs font-semibold text-primary hover:underline"
            >
              <MessageCircle className="h-3 w-3" />
              {repliesVisible
                ? 'Ẩn câu trả lời'
                : `Xem ${comment.replyCount} câu trả lời`}
            </button>
          )}

          {/* Render Replies */}
          {repliesVisible && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  showReplies={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* More Options */}
        <button className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-100 rounded-full h-fit">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
