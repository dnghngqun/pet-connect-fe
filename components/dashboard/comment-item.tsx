
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CommentItemProps {
  comment: any;
  replies: Record<number, any[]>;
  areRepliesVisible: Record<number, boolean>;
  onToggleReplies: (id: number) => void;
  onReply: (comment: any) => void;
}

const CommentItem = ({ comment, replies, areRepliesVisible, onToggleReplies, onReply }: CommentItemProps) => {
  const hasReplies = comment.replyCount > 0 || (replies[comment.id] && replies[comment.id].length > 0);
  const isExpanded = areRepliesVisible[comment.id];
  const childReplies = replies[comment.id] || [];

  return (
    <div className="flex gap-3 group">
      <div 
        className="w-8 h-8 rounded-full bg-cover bg-center shrink-0 cursor-pointer" 
        title={comment.petName ? `Pet: ${comment.petName}` : comment.userName}
        style={{ backgroundImage: `url('${comment.petAvatar || comment.userAvatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}')` }}
      ></div>
      <div className="flex-1">
        <div className="bg-[#f8f5f4] dark:bg-white/5 rounded-2xl rounded-tl-none p-3 relative group-hover:bg-[#f3eae7] dark:group-hover:bg-white/10 transition-colors">
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-bold text-sm text-[#1b110d] dark:text-white cursor-pointer hover:underline">
                {comment.petName ? (
                    <span className="flex items-center gap-1">
                        {comment.petName}
                        <span className="material-symbols-outlined text-[14px] text-orange-500" title="Pet Account">pets</span>
                    </span>
                ) : (comment.userName || 'User')}
            </span>
            <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-left">
            {comment.content}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 ml-2">
          <button 
            onClick={() => onReply(comment)}
            className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
          >
            Trả lời
          </button>
          {hasReplies && (
            <button 
                onClick={() => onToggleReplies(comment.id)}
                className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors"
            >
                {isExpanded ? 'Ẩn phản hồi' : `Xem ${comment.replyCount || childReplies.length} phản hồi`}
            </button>
          )}
        </div>

        {/* Nested Replies */}
        {isExpanded && (
            <div className="mt-3 space-y-3">
                {childReplies.map((reply: any, idx: number) => (
                    <CommentItem 
                        key={reply.id || idx} 
                        comment={reply} 
                        replies={replies} 
                        areRepliesVisible={areRepliesVisible} 
                        onToggleReplies={onToggleReplies} 
                        onReply={onReply} 
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
