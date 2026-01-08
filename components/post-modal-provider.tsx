'use client';

import React, { createContext, useContext, useState } from 'react';
import PostDetailModal from '@/components/post-detail-modal';
import petPostService, { PostDetail } from '@/services/petPostService';
import { PetPost } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface PostModalContextType {
  openPostModal: (idOrSlug: string) => Promise<void>;
  closePostModal: () => void;
  isOpen: boolean;
  isLoading: boolean;
}

const PostModalContext = createContext<PostModalContextType | undefined>(undefined);

export function usePostModal() {
  const context = useContext(PostModalContext);
  if (!context) {
    throw new Error('usePostModal must be used within a PostModalProvider');
  }
  return context;
}

export function PostModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<PetPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const openPostModal = async (idOrSlug: string) => {
    setIsLoading(true);
    try {
      // Fetch post details first
      const response = await petPostService.getPostBySlug(idOrSlug);
      const postDetail: PostDetail = response.data || response;
      
      // Convert PostDetail to PetPost
      const mappedPost: PetPost = {
        id: postDetail.id.toString(),
        title: postDetail.title,
        slug: postDetail.slug,
        description: postDetail.description,
        image: postDetail.image || (postDetail.media && postDetail.media.length > 0 ? (postDetail.media[0].imageUrl || "") : ""),
        images: postDetail.media?.map(m => m.imageUrl) || [],
        petType: postDetail.petType,
        status: postDetail.status as any,
        postType: postDetail.postType,
        location: postDetail.location,
        city: postDetail.city,
        district: postDetail.district,
        locationCoords: postDetail.latitude && postDetail.longitude ? {
          latitude: postDetail.latitude,
          longitude: postDetail.longitude
        } : undefined,
        postedBy: {
          id: postDetail.postedBy.id.toString(),
          name: postDetail.postedBy.name,
          phone: postDetail.postedBy.phone || "",
          avatar: postDetail.postedBy.avatar || undefined,
        },
        pet: postDetail.pet ? {
          id: postDetail.pet.id.toString(),
          name: postDetail.pet.name,
          breed: postDetail.pet.breed || undefined,
          age: postDetail.pet.age || 0,
          gender: postDetail.pet.gender as any,
          type: postDetail.pet.type,
          color: postDetail.pet.color || undefined,
          size: postDetail.pet.size as any,
          weight: postDetail.pet.weight || undefined,
          personality: postDetail.pet.personality,
          photos: postDetail.pet.photos,
          healthRecord: {
             id: postDetail.pet.healthRecord?.id.toString() || "0",
             vaccinations: postDetail.pet.healthRecord?.vaccinations?.map(v => ({
               name: v.name,
               date: v.vaccinationDate,
               nextDue: v.nextDueDate
             })) || [],
             medicalHistory: postDetail.pet.healthRecord?.medicalHistory?.map(m => ({
               date: m.visitDate,
               condition: m.condition,
               treatment: m.treatment,
               notes: m.notes
             })) || [],
             weight: [],
             lastCheckup: postDetail.pet.healthRecord?.lastCheckup || "",
             allergies: postDetail.pet.healthRecord?.allergies || [],
             notes: postDetail.pet.healthRecord?.notes || undefined
          }
        } : undefined,
        createdAt: postDetail.createdAt,
        reactionCount: postDetail.reactionCount || 0,
        commentCount: postDetail.comments?.total || 0,
        isFavorited: postDetail.isFavorited,
        userReaction: postDetail.userReaction || undefined,
        tags: postDetail.tags,
        views: postDetail.views,
        active: postDetail.isActive
      };

      setPost(mappedPost);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to load post for modal', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải chi tiết bài đăng",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closePostModal = () => {
    setIsOpen(false);
    // Don't clear post immediately to avoid flash
    setTimeout(() => setPost(null), 300);
  };

  return (
    <PostModalContext.Provider value={{ openPostModal, closePostModal, isOpen, isLoading }}>
      {children}
      {post && (
        <PostDetailModal
          post={post}
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) closePostModal();
            else setIsOpen(true);
          }}
        />
      )}
    </PostModalContext.Provider>
  );
}
