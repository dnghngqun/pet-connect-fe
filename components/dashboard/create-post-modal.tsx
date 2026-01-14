'use client';

import { useState, useRef, useEffect } from 'react';
import petPostService, { CreatePostRequest } from '@/services/petPostService';
import { useToast } from '@/components/ui/use-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: any;
  post?: any; // Post to edit
  onPostCreated?: () => void;
  groupId?: number; // Optional group ID for group posts
}

export default function CreatePostModal({ isOpen, onClose, pet, post, onPostCreated, groupId }: CreatePostModalProps) {
  const [content, setContent] = useState(post?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Initialize previews from existing post media
  const [previews, setPreviews] = useState<{ id?: number; url: string; type: 'image' | 'video' }[]>(() => {
    // Initial state will be populated by useEffect for existing posts
    return [];
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  // Determine action verb based on species
  const getActionVerb = (species: string) => {
    const s = species?.toLowerCase() || '';
    if (s.includes('dog') || s.includes('chó') || s.includes('cún')) return 'gâu';
    if (s.includes('cat') || s.includes('mèo') || s.includes('miu')) return 'meo';
    return 'kêu';
  };

  const getSoundPrefix = (species: string) => {
      const s = species?.toLowerCase() || '';
      if (s.includes('dog') || s.includes('chó') || s.includes('cún')) return 'Gâu gâu? ';
      if (s.includes('cat') || s.includes('mèo') || s.includes('miu')) return 'Meow meow? ';
      return '';
  };

  const actionVerb = pet ? getActionVerb(pet.species || pet.type) : 'kêu';
  const soundPrefix = pet ? getSoundPrefix(pet.species || pet.type) : '';

  // Cleanup effect for object URLs
  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const validateFile = (file: File): boolean => {
    // 5MB limit
    const maxSize = 5 * 1024 * 1024;
    // Allowed types: image/*, video/*, but specific extensions
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime'
    ];

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File quá lớn",
        description: `${file.name} vượt quá giới hạn 5MB.`,
      });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
         variant: "destructive",
         title: "Định dạng không hỗ trợ",
         description: `${file.name} không phải là ảnh hoặc video hợp lệ.`,
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesValues = Array.from(e.target.files);
      const validFiles: File[] = [];
      const newPreviews: { url: string; type: 'image' | 'video' }[] = [];

      filesValues.forEach(file => {
        if (validateFile(file)) {
          validFiles.push(file);
          newPreviews.push({
            url: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image'
          });
        }
      });

      setSelectedFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };



  // State for media handling
  const [existingMedia, setExistingMedia] = useState<{ id: number; url: string; type: 'image' | 'video' }[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);

  // Fetch full details on mount if editing
  useEffect(() => {
    if (post && post.id) {
        const fetchDetails = async () => {
            try {
                const res = await petPostService.getPostBySlug(String(post.id));
                if (res.success && res.data.media) {
                    const media = res.data.media.map((m: any) => ({
                        id: m.id,
                        url: m.imageUrl,
                        type: (m.imageUrl.includes('.mp4') || m.imageUrl.includes('.webm')) ? 'video' : 'image'
                    }));
                    setExistingMedia(media as any);
                    setPreviews(media as any);
                } else if (post.images) {
                    // Fallback to existing strings if fetch fails or no media object (legacy)
                    const media = post.images.map((url: string, idx: number) => ({
                         id: -1, // Placeholder, can't delete these
                         url: url,
                         type: 'image'
                    }));
                     setExistingMedia(media);
                     setPreviews(media);
                }
            } catch (e) {
                console.error("Failed to fetch post details for editing", e);
            }
        };
        fetchDetails();
    }
  }, [post]);

  const removeFile = (index: number) => {
    const target = previews[index];
    
    // If it's an existing media (has ID > 0), mark for deletion
    if (target.id && target.id > 0) {
        setDeletedMediaIds(prev => [...prev, target.id as number]);
        setExistingMedia(prev => prev.filter(m => m.id !== target.id));
    } else {
        // It's a new file (from selectedFiles), remove from there
        // Note: selectedFiles tracks *only new files*. We need to map index correctly.
        // The index in 'previews' might mix existing and new.
        // Strategy: Filter previews, rebuild selectedFiles?
        // Easier: Verify if 'target' corresponds to a File.
        // If we store the File object in previews? No, we store URL.
        
        // Let's refine the remove logic:
        // 'previews' is the source of truth for UI.
        // We need to sync selectedFiles. 
        // If we remove a new file, we need to find which File it was.
        // Since we blindly append to selectedFiles, let's keep it simple:
        // We'll trust the 'previews' state as the visual list.
        // For new files removal, we might need a better way to link Preview -> File.
        // Current implementation of 'handleFileSelect' appends to both.
        // The index in 'previews' includes existingMedia. 
        // e.g. [Existing1, Existing2, New1, New2]
        // If we remove index 2 (New1), it's the 0th element of selectedFiles.
        
        const existingCount = existingMedia.filter(m => !deletedMediaIds.includes(m.id)).length; 
        // Actually existingMedia state is already filtered when we remove? 
        // Wait, removeFile updates existingMedia or sets deletedMediaIds.
        
        // Correct approach:
        // If target has ID, it's existing.
        // If target has NO ID, it's new.
        // Find its index among *new* files.
    }

    setPreviews(prev => {
        const newPrev = [...prev];
        const item = newPrev[index];
        if (item && !item.id) { // Only revoke if it's a blob url (new file)
             URL.revokeObjectURL(item.url);
        }
        return newPrev.filter((_, i) => i !== index);
    });
    
    // Sync selectedFiles
    if (!target.id || target.id === -1) {
         // It is a new file. We need to find which one.
         // This is tricky with current state. 
         // FIX: Let's reconstruct selectedFiles on submit or track them better.
         // Or, simply:
         // count how many *new* items were before this index.
         const priorNewCount = previews.slice(0, index).filter(p => !p.id || p.id === -1).length;
         setSelectedFiles(prev => prev.filter((_, i) => i !== priorNewCount));
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim() && selectedFiles.length === 0 && previews.length === 0 && !post) return;
    
    setIsLoading(true);
    try {
      if (post) {
        // Edit mode
        
        // 1. Update Post Details
        const response = await petPostService.updatePost(post.id, {
            description: content,
            status: 'PUBLISHED',
            postType: 'GENERAL',
            city: post.city || 'Unknown',
        });
        
        if (!response || (!response.success && !response.data?.id)) {
             throw new Error(response?.message || 'Failed to update post content');
        }

        // 2. Upload New Images
        if (selectedFiles.length > 0) {
            await petPostService.uploadImages(post.id, selectedFiles);
        }

        // 3. Delete Removed Images
        if (deletedMediaIds.length > 0) {
            await Promise.all(deletedMediaIds.map(id => petPostService.deleteImage(post.id, id)));
        }

        toast({
            title: "Thành công",
            description: "Bài viết của bạn đã được cập nhật.",
        });
        if (onPostCreated) onPostCreated();
        onClose();

      } else {
        // Create mode
          const postData: CreatePostRequest = {
            title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            description: content,
            petType: pet.species || 'DOG',
            status: 'PUBLISHED',
            postType: 'GENERAL',
            city: 'Unknown',
            petId: pet.id,
            tags: [],
            ...(groupId && { groupIds: [groupId] }), // Backend expects groupIds array
          };
    
          const response = await petPostService.createPost(postData, selectedFiles);
          
          if (response && (response.success || response.data?.id)) {
            setContent('');
            setSelectedFiles([]);
            setPreviews([]);
            toast({
              title: "Thành công",
              description: "Bài viết của bạn đã được đăng tải.",
            });
            if (onPostCreated) onPostCreated();
            onClose();
          } else {
            throw new Error(response?.message || 'Failed to create post');
          }
      }
    } catch (error) {
      console.error('Action error:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ margin: 0}}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#232329] rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-fade-in-up transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-xl font-bold tracking-tight text-[#1b110d] dark:text-white">{post ? 'Chỉnh sửa bài viết' : 'Tạo bài đăng mới'}</h2>
          <button 
            onClick={onClose}
            className="group p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500 group-hover:text-[#f06e42] transition-colors">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Pet Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <div 
                className="w-14 h-14 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-[#232329] shadow-sm"
                style={{
                  backgroundImage: pet.profilePhoto
                    ? `url('${pet.profilePhoto}')`
                    : 'url(https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100)',
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-[#f06e42] text-white p-1 rounded-full border-2 border-white dark:border-[#232329] flex items-center justify-center w-6 h-6">
                <span className="material-symbols-outlined text-[14px]">pets</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full justify-center">
              <h3 className="font-bold text-[#1b110d] dark:text-white text-lg leading-tight">{pet.name}</h3>
            </div>
          </div>

          {/* Text Input */}
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[120px] bg-transparent border-none p-0 text-lg text-[#1b110d] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 resize-none leading-relaxed"
              placeholder={`${soundPrefix}Hôm nay ${pet.name} muốn ${actionVerb} về chuyện gì?`}
              disabled={isLoading}
            />
          </div>

          {/* Previews */}
          {previews.length > 0 && (
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {previews.map((file, index) => (
                   <div key={index} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100 dark:bg-black/20">
                      {file.type === 'video' ? (
                         <video src={file.url} className="w-full h-full object-cover" controls />
                      ) : (
                         <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                         <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                   </div>
                ))}
             </div>
          )}


            
            {/* Disable file upload in edit mode for now */}
            {/* File Upload Area - Always visible now */}
            <div 
                  className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-[#f06e42]/50 hover:bg-[#f06e42]/5 transition-all duration-300"
                  onClick={() => fileInputRef.current?.click()}
               >
                 <input 
                    ref={fileInputRef}
                    className="hidden" 
                    type="file" 
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                 />
                 <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                   <div className="w-12 h-12 mb-3 rounded-full bg-orange-50 dark:bg-white/5 text-[#f06e42] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                   </div>
                   <p className="font-semibold text-[#1b110d] dark:text-white">Thêm ảnh hoặc video</p>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kéo thả hoặc nhấn để tải lên (Tối đa 5MB)</p>
                 </div>
               </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm rounded-b-xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Thêm vào bài viết:</p>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px] text-green-500">image</span>
              <span className="hidden sm:inline">Ảnh/Video</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium ml-auto sm:ml-0">
              <span className="material-symbols-outlined text-[20px] text-red-500">location_on</span>
              <span className="hidden sm:inline">Check-in</span>
            </button>
          </div>
          
          <button 
            onClick={handleCreatePost}
            disabled={isLoading || (!content.trim() && selectedFiles.length === 0)}
            className="w-full flex items-center justify-center gap-2 bg-[#f06e42] hover:bg-[#d9522c] text-white font-bold text-base py-3 px-6 rounded-lg shadow-lg shadow-[#f06e42]/30 transform active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                    <span>{post ? 'Cập nhật' : 'Đăng bài ngay'}</span>
                    <span className="material-symbols-outlined">send</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
