'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PostListItem, PostDetail } from '@/services/petPostService';
import petPostService from '@/services/petPostService';
import { useAuth } from '@/hooks/useAuth';
import CreatePostModal from './create-post-modal';
import CommentItem from './comment-item';

interface PostDetailModalProps {
  post: PostListItem;
  onClose: () => void;
  onPostUpdate?: (updatedPost: PostListItem) => void;
  currentPetId?: number;
}

export default function PostDetailModal({ post: initialPost, onClose, onPostUpdate, currentPetId }: PostDetailModalProps) {
  const { user } = useAuth();
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [currMediaIdx, setCurrMediaIdx] = useState(0);
  const [replyTo, setReplyTo] = useState<{id: number, name: string} | null>(null);
  const [currentPet, setCurrentPet] = useState<any>(null);
  const [replies, setReplies] = useState<Record<number, any[]>>({});
  const [areRepliesVisible, setAreRepliesVisible] = useState<Record<number, boolean>>({});
  
  // Local state for actions to give immediate feedback
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Use initial post data for immediate rendering while fetching full details
  const displayPost = postDetail || initialPost;

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Fetch full details
        const detailRes = await petPostService.getPostBySlug(String(initialPost.id), currentPetId); // Using ID as slug fallback
        if (detailRes.success) {
            setPostDetail(detailRes.data);
            setIsLiked(detailRes.data.isFavorited || false); // Note: backend DTO might have mixed up fields, userReaction check needed or isFavorited? 
            // Checking DTO: isFavorited is for bookmark/save usually. userReaction is for Like.
            // Let's check PostDetailDTO again. 
            // userReaction stores string "LIKE". isFavorited is boolean.
            // So:
            // isLiked = !!detailRes.data.userReaction
            // isSaved = detailRes.data.isFavorited
            setIsLiked(!!detailRes.data.userReaction);
            setLikeCount(detailRes.data.reactionCount || 0);
            setIsSaved(detailRes.data.isFavorited || false);
        }

        // Fetch comments
        const commentsRes = await petPostService.getComments(initialPost.id);
        if (commentsRes.success) {
            setComments(commentsRes.data.comments || []);
        }

      } catch (error) {
        console.error("Failed to load post details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      document.body.style.overflow = 'unset';
    };
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [initialPost.id]);

  useEffect(() => {
    // Load currentPet from localStorage on mount
    const storedPet = localStorage.getItem('currentPet');
    if (storedPet) {
        try {
            setCurrentPet(JSON.parse(storedPet));
        } catch (e) {
            console.error("Failed to parse currentPet", e);
        }
    }
  }, []);

  const toggleReplies = async (commentId: number) => {
    // Toggle visibility
    setAreRepliesVisible(prev => ({ ...prev, [commentId]: !prev[commentId] }));

    // If opening and not loaded, fetch
    if (!areRepliesVisible[commentId] && !replies[commentId]) {
        try {
            const res = await petPostService.getReplies(commentId);
            if (res.success) {
                setReplies(prev => ({ ...prev, [commentId]: res.data.comments || [] }));
            }
        } catch (e) {
            console.error("Failed to fetch replies", e);
        }
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
        const payload: any = { content: commentText };
        if (replyTo) {
            payload.parentCommentId = replyTo.id;
        }
        
        // Robust check: Try state first, fallback to fresh localStorage read
        let selectedPetId = currentPet?.id;
        if (!selectedPetId) {
             const storedPet = localStorage.getItem('currentPet');
             if (storedPet) {
                try {
                    const parsed = JSON.parse(storedPet);
                    selectedPetId = parsed.id;
                } catch(e) {}
             }
        }

        // Use prop if available, else fallback
        if (currentPetId) {
            payload.petId = currentPetId;
        } else if (selectedPetId) {
            payload.petId = selectedPetId;
        }

        const res = await petPostService.addComment(initialPost.id, payload);
        if (res.success) {
            const newComment = res.data;
            
            if (replyTo) {
                 // It's a reply
                 const parentId = replyTo.id;
                 
                 // Update the parent's reply count in the main list visually (optional but good)
                 // Recursive update is hard without flat list or tree traversal helper.
                 // For now, simple optimistic update might be just adding to the replies map.
                 // If parentId is not in comments (level 1), we might need to find where it is.
                 // But simply adding to replies[parentId] works for rendering if parent is visible.
                 
                 setReplies(prev => ({
                    ...prev,
                    [parentId]: [...(prev[parentId] || []), newComment]
                 }));
                 
                 // Ensure visible
                 setAreRepliesVisible(prev => ({ ...prev, [parentId]: true }));

            } else {
                 // Top level
                 setComments(prev => [newComment, ...prev]);
            }

            setCommentText('');
            setReplyTo(null);
        }
    } catch (error) {
        console.error("Failed to send comment", error);
    }
  };

  const handleLike = async () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
    setLikeCount(newLikeCount);
    
    try {
        await petPostService.reactToPost(initialPost.id, newIsLiked ? 'LIKE' : 'LIKE', currentPetId);
        
        // Callback to parent
        if (onPostUpdate) {
            onPostUpdate({
                ...initialPost,
                reactionCount: newLikeCount,
                isFavorited: newIsLiked
            } as any);
        }
    } catch (e) {
        // Revert
        setIsLiked(!newIsLiked);
        setLikeCount(likeCount);
    }

  };

  const handleSave = async () => {
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);
    try {
        await petPostService.toggleFavorite(initialPost.id);
    } catch (e) {
        setIsSaved(!newIsSaved);
    }
  };

  /* Removed old handleNestedReply and handleReply specific logic, used generic onReply */
  
  const handleGenericReply = (targetComment: any) => {
    // Reply to the SPECIFIC comment (effectively creating a child of it)
    setReplyTo({ id: targetComment.id, name: targetComment.petName || targetComment.userName || 'User' });
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) input.focus();
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
        const res = await petPostService.deletePost(initialPost.id);
        // If success, close modal and maybe refresh feed (handled by parent?)
        // Ideally we call a callback passed from parent to refresh
        onClose();
        // Since we don't have a callback to refresh feed, the user might need to refresh manually or we rely on SWR/React Query if used.
        // For now, simple close. The items will remain in feed until refresh.
        // Better: window.location.reload() or router.refresh()?
        // Using window.location.reload() for now as quick fix or just close.
        window.location.reload(); 
    } catch (e) {
        console.error("Failed to delete post", e);
        alert('Có lỗi xảy ra khi xóa bài viết');
    }
  };

 
  const isOwner = (() => {
    if (typeof window === 'undefined') return false;
    
    // Check Pet Ownership
    if (displayPost.pet) {
        return currentPet && String(currentPet.id) === String(displayPost.pet.id);
    }
    
    // Check User Ownership (Legacy/General posts)
    return user && displayPost.postedBy && (String(user._id) === String(displayPost.postedBy.id));
  })();

  const handlePostUpdated = async () => {
     // Reload post details
     const detailRes = await petPostService.getPostBySlug(String(initialPost.id));
     if (detailRes.success) {
         setPostDetail(detailRes.data);
         if (onPostUpdate) onPostUpdate(detailRes.data as unknown as PostListItem);
     }
     setIsEditing(false);
  };

  const images = (postDetail?.media && postDetail.media.length > 0) 
    ? postDetail.media.map(m => m.imageUrl)
    : (initialPost.images && initialPost.images.length > 0 ? initialPost.images : (initialPost.image ? [initialPost.image] : []));


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8" role="dialog" aria-modal="true">
      <div 
        className="absolute inset-0 bg-[#0f0a08]/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-[#1e1e24] w-full max-w-[95vw] h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row ring-1 ring-white/10 animate-fade-in-up">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 lg:left-4 lg:right-auto z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        {/* Left Side - Media: Flex-1 to take all available space */ }
        <div className="flex-1 h-[50vh] lg:h-full bg-black flex items-center justify-center relative bg-[#0f0a08] group/media min-w-0">
          {/* Background Blur Effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 transition-all duration-500" 
            style={{ backgroundImage: `url('${images[currMediaIdx] || ''}')` }}
          ></div>
          
          {/* Main Image/Video */}
          {images.length > 0 ? (
             (() => {
                const url = images[currMediaIdx];
                const isVideo = url && (url.includes('.mp4') || url.includes('.webm'));
                if (isVideo) {
                    return (
                        <video 
                            src={url} 
                            controls 
                            className="relative z-10 max-w-full max-h-full object-contain"
                        />
                    );
                }
                return (
                    <img 
                        src={url} 
                        alt="Post content" 
                        className="relative z-10 w-full h-full object-contain transition-opacity duration-300" 
                    />
                );
             })()
          ) : (
            <div className="text-white">No media</div>
          )}
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
                <button 
                    onClick={(e) => { e.stopPropagation(); setCurrMediaIdx(prev => (prev - 1 + images.length) % images.length); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setCurrMediaIdx(prev => (prev + 1) % images.length); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </>
          )}

          {/* Dots Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={(e) => { e.stopPropagation(); setCurrMediaIdx(idx); }}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currMediaIdx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                    ></button>
                ))}
            </div>
          )}
        </div>

        {/* Right Side - Details & Comments: Fixed width to ensure media is big */ }
        <div className="w-full lg:w-[400px] flex flex-col h-full bg-white dark:bg-[#1e1e24] border-l border-white/10 shrink-0">
          
          {/* Header */}
          <div className="p-4 border-b border-[#f3eae7] dark:border-white/5 flex items-center justify-between shrink-0 bg-white dark:bg-[#1e1e24] z-10">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full bg-cover bg-center ring-2 ring-primary/20" 
                style={{ 
                    backgroundImage: displayPost.postedBy.avatar 
                        ? `url('${displayPost.postedBy.avatar}')` 
                        : 'url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100)' 
                }}
              ></div>
              <div>
                <h3 className="font-bold text-[#1b110d] dark:text-white text-base">{displayPost.postedBy.name}</h3>
                <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true, locale: vi })}
                    {displayPost.location && ` • ${displayPost.location}`}
                </p>
              </div>
            </div>
            <div className="relative">
                <button 
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
                
                {showOptions && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-[#232329] rounded-lg shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-200">
                        {isOwner ? (
                            <>
                                <button 
                                    onClick={() => { 
                                        if (!displayPost.pet) {
                                            alert("Không thể chỉnh sửa bài viết này (không tìm thấy thông tin thú cưng)");
                                            return;
                                        }
                                        setShowOptions(false); 
                                        setIsEditing(true); 
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Sửa
                                </button>
                                <button 
                                    onClick={() => { setShowOptions(false); handleDelete(); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Xóa
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => { setShowOptions(false); /* Report? */ }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">flag</span>
                                Báo cáo
                            </button>
                        )}
                    </div>
                )}
            </div>
            {/* Overlay to close options when clicking outside */}
            {showOptions && (
                <div className="fixed inset-0 z-20" onClick={() => setShowOptions(false)}></div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white dark:bg-[#1e1e24]">
            {/* Caption */}
            <div className="mb-6">
              <p className="text-[#1b110d] dark:text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap">
                {displayPost.description}
              </p>
              {displayPost.tags && displayPost.tags.length > 0 && (
                 <div className="mt-2 flex flex-wrap gap-2">
                    {displayPost.tags.map(tag => (
                        <span key={tag} className="text-primary font-medium hover:underline cursor-pointer">#{tag}</span>
                    ))}
                 </div>
              )}
            </div>

            {/* Comments Section */}
            <div>
              <h4 className="font-bold text-sm text-[#1b110d] dark:text-white mb-4 border-b border-[#f3eae7] dark:border-white/5 pb-2 inline-block">
                Bình luận ({displayPost.commentCount || comments.length})
              </h4>
              
              <div className="space-y-5">
                {loading && comments.length === 0 ? (
                    <div className="flex justify-center p-4">
                        <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                    </div>
                ) : (

                    comments.map((comment, idx) => (
                        <CommentItem 
                            key={comment.id || idx} 
                            comment={comment} 
                            replies={replies} 
                            areRepliesVisible={areRepliesVisible} 
                            onToggleReplies={toggleReplies} 
                            onReply={handleGenericReply} 
                        />
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Footer / Input Area */}
          <div className="p-4 border-t border-[#f3eae7] dark:border-white/5 bg-white dark:bg-[#1e1e24] shrink-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-6">
                <button 
                    onClick={handleLike}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors group" title="Thích"
                >
                  <span className={`material-symbols-outlined group-active:scale-90 transition-transform ${isLiked ? 'icon-filled text-red-500' : ''}`}>favorite</span>
                  <span className="font-bold text-sm">{likeCount}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors group">
                  <span className="material-symbols-outlined group-active:scale-90 transition-transform">mode_comment</span>
                  <span className="font-bold text-sm">{displayPost.commentCount || comments.length}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors group">
                  <span className="material-symbols-outlined group-active:scale-90 transition-transform">share</span>
                  <span className="font-bold text-sm hidden sm:inline">Chia sẻ</span>
                </button>
              </div>
              <button 
                onClick={handleSave}
                className={`text-gray-400 hover:text-primary transition-colors ${isSaved ? 'text-primary' : ''}`}
            >
                <span className={`material-symbols-outlined ${isSaved ? 'icon-filled' : ''}`}>bookmark</span>
              </button>
            </div>

            <div className="flex gap-3 items-center">
              {/* Current User/Pet Avatar input area */}
              {(() => {
                 const avatarUrl = currentPet?.profilePhoto || currentPet?.image || user?.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100';
                 
                 return (
                  <div 
                    className="w-9 h-9 rounded-full bg-cover bg-center shrink-0 shadow-sm" 
                    style={{ backgroundImage: `url('${avatarUrl}')` }}
                    title={currentPet ? `Commenting as ${currentPet.name}` : `Commenting as ${user?.name}`}
                  ></div>
                 );
              })()}
              
              <div className="flex-1 relative group">
                {replyTo && (
                    <div className="absolute -top-6 left-0 text-xs text-gray-500 flex items-center gap-1">
                        Replying to <span className="font-bold">{replyTo.name}</span>
                        <button onClick={() => setReplyTo(null)} className="hover:text-red-500"><span className="material-symbols-outlined text-[14px]">close</span></button>
                    </div>
                )}
                <input 
                    className="w-full bg-[#f8f5f4] dark:bg-black/20 border-none rounded-full py-2.5 pl-4 pr-14 text-sm focus:ring-1 focus:ring-primary focus:bg-white dark:focus:bg-black/40 transition-all placeholder-gray-400" 
                    placeholder="Viết bình luận của bạn..." 
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                />
                <button 
                    onClick={handleSendComment}
                    disabled={!commentText.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-primary hover:bg-primary/10 rounded-full p-1.5 transition-colors disabled:opacity-50 font-bold text-xs uppercase tracking-wide"
                >
                    Đăng
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Edit Modal */}
      {isEditing && displayPost.pet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
             <CreatePostModal 
                isOpen={true} 
                onClose={() => setIsEditing(false)} 
                pet={displayPost.pet}
                post={displayPost}
                onPostCreated={handlePostUpdated}
             />
        </div>
      )}
    </div>
  );
}
