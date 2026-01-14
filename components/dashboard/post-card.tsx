'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PostListItem } from '@/services/petPostService';
import petPostService from '@/services/petPostService';
import { useAuth } from '@/hooks/useAuth';
import CreatePostModal from './create-post-modal';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import ConfirmModal from '@/components/common/confirm-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: PostListItem;
  onClick?: () => void;
  onPostUpdate?: (updatedPost: PostListItem) => void;
  currentPetId?: number;
}

export default function PostCard({ post, onClick, onPostUpdate, currentPetId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false); // Default false, will set in useEffect if data available
  const [likeCount, setLikeCount] = useState(post.reactionCount || 0);

  // Sync state with props
  useEffect(() => {
    setLikeCount(post.reactionCount || 0);
    
    // Check userReaction first for Like status
    if (post.userReaction) {
        setIsLiked(post.userReaction === 'LIKE');
    } else if ((post as any).isFavorited !== undefined) {
        // Fallback or if isFavorited is explicitly used (though mapped to Saved in backend now)
        // We should trust userReaction for Likes. 
        // If userReaction is missing, assume not liked or fallback if needed.
        // For now, if userReaction is present, use it.
    }
  }, [post]);

  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isOwner = (() => {
    if (!user) return false;
    const userIdStr = String(user._id);
    
    // Case 1: Post by User (postedBy.id matches User ID)
    if (post.postedBy && String(post.postedBy.id) === userIdStr) return true;

    // Case 2: Post by Pet (check if Pet belongs to User)
    // If post has associated pet info, check if its userId matches current user
    if (post.pet && String(post.pet.userId) === userIdStr) return true;
    
    return false; 
  })();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
        await petPostService.deletePost(post.id);
        toast.success('Đã xóa bài viết');
        window.location.reload();
    } catch (error) {
        console.error("Failed to delete post", error);
        toast.error('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };
  
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
    setLikeCount(newLikeCount);

    try {
        await petPostService.reactToPost(post.id, 'LIKE', currentPetId);
        if (onPostUpdate) {
            onPostUpdate({
                ...post,
                reactionCount: newLikeCount,
                userReaction: newIsLiked ? 'LIKE' : undefined,
                // Keep isFavorited as is, unless we want to track it separately
            });
        }
    } catch (error) {
        // Revert on failure
        setIsLiked(!newIsLiked);
        setLikeCount(likeCount);
        console.error("Failed to toggle like", error);
    }
  };

  return (
    <article className="bg-white dark:bg-[#232329] rounded-2xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={post.pet?.id ? `/pets/${post.pet.id}/profile` : '#'} onClick={(e) => e.stopPropagation()}>
            <div
              className="w-10 h-10 rounded-full bg-cover bg-center ring-2 ring-offset-2 ring-[#f06e42]/20 ring-offset-white dark:ring-offset-[#232329] cursor-pointer hover:ring-[#f06e42]/50 transition-all"
              style={{
                backgroundImage: post.postedBy.avatar
                  ? `url('${post.postedBy.avatar}')`
                  : 'url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100)',
              }}
            />
          </Link>
          <div>
            <Link href={post.pet?.id ? `/pets/${post.pet.id}/profile` : '#'} onClick={(e) => e.stopPropagation()} className="hover:underline">
              <h3 className="text-[#1b110d] dark:text-white font-bold text-base leading-tight">
                {post.postedBy.name}
              </h3>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
              {post.location && ` • ${post.location}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-400 hover:text-[#1b110d] dark:hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 z-50 bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-gray-800">
                    <DropdownMenuItem onClick={handleEdit} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10">
                      <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 focus:bg-red-50 dark:focus:bg-red-900/10">
                      <span className="material-symbols-outlined text-[18px] mr-2">delete</span>
                      Xóa bài
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
            {!isOwner && (
                <button className="text-gray-400 hover:text-[#1b110d] dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
            )}
        </div>
      </div>
      
      <CreatePostModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        pet={null} // Editing doesn't need pet selection context usually, or use post.pet
        post={post} // Pass post for editing
        onPostCreated={() => window.location.reload()} // Refresh after edit
      />

      {/* Content */}
      <div className="px-4 pb-3 cursor-pointer" onClick={onClick}>
        <p className="text-[#1b110d] dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
          {post.description}
        </p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag, index) => (
              <span key={index} className="text-[#f06e42] font-medium text-sm">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {/* Media */ }
      {
        (() => {
          const images = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
          
          if (images.length === 0) return null;

          const isVideo = (url: string) => {
             return url && (url.includes('.mp4') || 
                    url.includes('.webm') || 
                    url.includes('.mov') || 
                    url.includes('/video/upload/'));
          };

          // If first item is video, just show it (simple handling for now)
          if (isVideo(images[0])) {
            return (
              <div 
                className="w-full bg-black aspect-video relative group cursor-pointer"
                onClick={onClick}
              >
                <video 
                  src={images[0]} 
                  controls={false} // Disable controls to allow click through to modal? Or keep controls but handle click elsewhere? 
                  // If we want modal on click, video native controls might capture click. 
                  // For now, let's allow click on container.
                  className="w-full h-full object-contain pointer-events-none" 
                  preload="metadata"
                />
                 {/* Play icon overlay */}
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none">
                     <span className="material-symbols-outlined text-white text-4xl opacity-80">play_circle</span>
                 </div>
              </div>
            );
          }

          // 1 Image (Full width)
          if (images.length === 1) {
            return (
              <div
                className="w-full bg-gray-100 dark:bg-black aspect-[4/3] bg-cover bg-center cursor-pointer relative group"
                style={{ backgroundImage: `url('${images[0]}')` }}
                onClick={onClick}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
              </div>
            );
          }

          // 2 Images (Side by side)
          if (images.length === 2) {
             return (
              <div className="grid grid-cols-2 gap-0.5 aspect-[4/3]" onClick={onClick}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-full h-full bg-gray-100 dark:bg-black bg-cover bg-center cursor-pointer relative group"
                    style={{ backgroundImage: `url('${img}')` }}
                  >
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                  </div>
                ))}
              </div>
             );
          }
          
          // 3 Images (1 Left, 2 Right)
          if (images.length === 3) {
             return (
              <div className="grid grid-cols-2 gap-0.5 aspect-[4/3]" onClick={onClick}>
                 <div
                    className="w-full h-full bg-gray-100 dark:bg-black bg-cover bg-center cursor-pointer relative group"
                    style={{ backgroundImage: `url('${images[0]}')` }}
                  >
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                  </div>
                 <div className="grid grid-rows-2 gap-0.5 h-full">
                     {images.slice(1, 3).map((img, idx) => (
                        <div
                           key={idx}
                           className="w-full h-full bg-gray-100 dark:bg-black bg-cover bg-center cursor-pointer relative group"
                           style={{ backgroundImage: `url('${img}')` }}
                         >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                         </div>
                     ))}
                 </div>
              </div>
             );
          }

          // 4 Images (1 Top, 3 Bottom)
          if (images.length === 4) {
             return (
               <div className="flex flex-col gap-0.5 aspect-[4/3]" onClick={onClick}>
                  <div 
                    className="w-full h-[60%] bg-gray-100 dark:bg-black bg-cover bg-center cursor-pointer relative group"
                    style={{ backgroundImage: `url('${images[0]}')` }}
                  >
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-0.5 h-[40%]">
                      {images.slice(1, 4).map((img, idx) => (
                        <div
                           key={idx}
                           className="w-full h-full bg-gray-100 dark:bg-black bg-cover bg-center cursor-pointer relative group"
                           style={{ backgroundImage: `url('${img}')` }}
                         >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                         </div>
                     ))}
                  </div>
               </div>
             );
          }

          // 5 or more images (2 Top, 3 Bottom)
          if (images.length >= 5) {
             return (
              <div className="flex flex-col gap-0.5 aspect-[4/3]" onClick={onClick}>
                 <div className="grid grid-cols-2 gap-0.5 h-[60%]">
                     {images.slice(0, 2).map((img, idx) => (
                        <div
                           key={idx}
                           className="w-full h-full bg-gray-100 dark:bg-black bg-cover bg-center cursor-pointer relative group"
                           style={{ backgroundImage: `url('${img}')` }}
                         >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                         </div>
                     ))}
                 </div>
                 <div className="grid grid-cols-3 gap-0.5 h-[40%]">
                     {images.slice(2, 5).map((img, idx) => {
                        // The last image (index 4 in 0-based array) handles the overlay
                        const isLast = idx === 2; 
                        return (
                          <div
                             key={idx}
                             className="w-full h-full bg-gray-100 dark:bg-black bg-cover bg-center cursor-pointer relative group"
                             style={{ backgroundImage: `url('${img}')` }}
                           >
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                              {isLast && images.length > 5 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl cursor-pointer">
                                  +{images.length - 5}
                                </div>
                              )}
                           </div>
                        );
                     })}
                 </div>
              </div>
             );
          }
        })()
      }

      {/* Actions */}
      <div className="p-4 flex items-center justify-between border-t border-[#f3eae7] dark:border-white/5">
        <div className="flex gap-4 sm:gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors group ${
              isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
            }`}
          >
            <span className={`material-symbols-outlined ${isLiked ? 'icon-filled' : 'group-hover:scale-110 transition-transform'}`}>favorite</span>
            <span className="font-medium text-sm">Thích ({likeCount})</span>
          </button>
          
          <button 
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#f06e42] transition-colors group"
            onClick={onClick}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">mode_comment</span>
            <span className="font-medium text-sm">Bình luận ({post.commentCount || 0})</span>
          </button>
          
          <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
            <span className="font-medium text-sm hidden sm:inline">Chia sẻ</span>
          </button>
        </div>
        
        <button className="text-gray-400 hover:text-[#f06e42] transition-colors">
          <span className="material-symbols-outlined">bookmark</span>
        </button>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        isDestructive={true}
      />
    </article>
  );
}
