// Pet Post Service - Real API calls
// Based on PostController.java endpoints

import { COMMON_API } from '@/common/Constant/COMMON_API';
import apiClient from '@/common/apiClient';

// ============ Types based on backend DTOs ============

// PosterDTO
export interface Poster {
  id: number;
  name: string;
  phone: string;
  avatar: string | null;
}

// PetInfoDTO
export interface PetInfo {
  id: number;
  userId: number;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  gender: string | null;
  color: string | null;
  size: string | null;
  weight: number | null;
  personality: string[];
  specialNeeds: string | null;
  bio: string | null;
  isNeutered: boolean | null;
  isVaccinated: boolean | null;
  profilePhoto: string | null;
  photos: string[];
  qrCodeUrl: string | null;
  healthRecord: {
    id: number;
    allergies: string[];
    notes: string | null;
    lastCheckup: string | null;
    weight: number | null;
    vaccinations: { id: number; name: string; vaccinationDate: string; nextDueDate?: string; notes?: string }[];
    medicalHistory: { id: number; visitDate: string; condition: string; treatment: string; notes?: string; weight?: number }[];
  } | null;
}

// PostListItemDTO
export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  petType: string;
  status: string;
  postType?: string;
  city: string;
  district: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  views: number;
  featured: boolean;
  isActive: boolean;
  tags: string[];
  postedBy: Poster;
  pet: PetInfo | null;
  mediaCount: number;
  reactionCount?: number;
  favoriteCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

// PostDetailDTO
export interface PostDetail {
  id: number;
  title: string;
  slug: string;
  petType: string;
  status: string;
  postType?: string;
  location: string;
  city: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  image: string;
  description: string;
  views: number;
  featured: boolean;
  isActive: boolean;
  tags: string[];
  meta?: Record<string, any>;
  reactionCount?: number;
  favoriteCount?: number;
  userReaction?: string | null;
  isFavorited?: boolean;
  postedBy: {
    id: number;
    name: string;
    phone: string;
    avatar: string | null;
    email: string | null;
    createdAt: string;
    totalPosts: number;
  };
  pet: PetInfo | null;
  media: { id: number; imageUrl: string; isThumbnail: boolean }[];
  comments: {
    total: number;
    items: any[];
  };
  relatedPosts: PostListItem[];
  createdAt: string;
  updatedAt: string;
}

// API Response wrapper from ResponseHandler
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  code?: string;
  message: string;
  data: T;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

// Paginated response
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

// ============ Request Types ============

export interface GetPostsParams {
  page?: number;
  size?: number;
  status?: string;
  petType?: string;
  city?: string;
  district?: string;
  search?: string;
  q?: string;
  type?: string;
  tags?: string[];
  featured?: boolean;
  sort?: string;
}

export interface CreatePostRequest {
  title: string;
  description: string;
  petType: string;
  status: string;
  postType?: string;
  city: string;
  district: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  meta?: Record<string, any>;
  petId?: number;
  pet?: {
    name?: string;
    breed?: string;
    age?: number;
    gender?: string;
    color?: string;
    size?: string;
    weight?: number;
    isNeutered?: boolean;
    isVaccinated?: boolean;
    personality?: string[];
    specialNeeds?: string;
    bio?: string;
  };
  healthRecord?: {
    weight?: number;
    allergies?: string[];
    notes?: string;
    vaccinations?: Array<{ name: string; date: string }>;
    medicalHistory?: Array<{ condition: string; treatment: string; date: string; notes?: string }>;
  };
}

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  status?: string;
  postType?: string;
  city?: string;
  district?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  meta?: Record<string, any>;
  isActive?: boolean;
  pet?: {
     name?: string;
     breed?: string;
     age?: number;
     gender?: string;
     color?: string;
     size?: string;
     weight?: number;
     personality?: string[];
     specialNeeds?: string;
     bio?: string;
     isVaccinated?: boolean;
     isNeutered?: boolean;
  };
  healthRecord?: {
    weight?: number;
    allergies?: string[];
    notes?: string;
    vaccinations?: any[];
    medicalHistory?: any[];
  };
}

// ============ Service Functions ============

const petPostService = {
  /**
   * API 1: Get posts list with filters
   * GET /api/v1/posts
   */
  async getPosts(params: GetPostsParams = {}): Promise<ApiResponse<{ posts: PostListItem[] }>> {
    const response = await apiClient.get<ApiResponse<{ posts: PostListItem[] }>>(COMMON_API.posts, {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        status: params.status,
        petType: params.petType,
        city: params.city,
        district: params.district,
        search: params.search || params.q,
        q: params.q,
        type: params.type,
        tags: params.tags,
        featured: params.featured,
        sort: params.sort || 'createdAt,desc',
      },
    });
    return response.data as ApiResponse<{ posts: PostListItem[] }>;
  },

  /**
   * API 2: Get post detail by ID or slug
   * GET /api/v1/posts/{idOrSlug}
   */
  async getPostBySlug(idOrSlug: string): Promise<ApiResponse<PostDetail>> {
    const response = await apiClient.get(COMMON_API.postDetail(idOrSlug));
    return response.data;
  },

  /**
   * API 3: Get current user's posts
   * GET /api/v1/posts/my-posts
   */
  async getMyPosts(params: { status?: string; isActive?: boolean; page?: number; size?: number } = {}): Promise<ApiResponse<{ posts: PostListItem[] }>> {
    const response = await apiClient.get<ApiResponse<{ posts: PostListItem[] }>>(COMMON_API.myPosts, {
      params: {
        status: params.status,
        isActive: params.isActive,
        page: params.page || 0,
        size: params.size || 10,
      },
    });
    return response.data;
  },

  /**
   * Get user's favorited/saved posts
   * GET /api/v1/posts/favorites
   */
  async getFavoritePosts(params: { page?: number; size?: number } = {}): Promise<ApiResponse<{ posts: PostListItem[] }>> {
    const response = await apiClient.get(COMMON_API.favoritePosts, {
      params: {
        page: params.page || 0,
        size: params.size || 10,
      },
    });
    return response.data;
  },

  /**
   * Get user's liked posts
   * GET /api/v1/posts/liked
   */
  async getLikedPosts(params: { page?: number; size?: number } = {}): Promise<ApiResponse<{ posts: PostListItem[] }>> {
    const response = await apiClient.get(COMMON_API.likedPosts, {
      params: {
        page: params.page || 0,
        size: params.size || 10,
      },
    });
    return response.data;
  },

  /**
   * API 4: Create new post
   * POST /api/v1/posts
   */
  async createPost(postData: CreatePostRequest, images?: File[]): Promise<ApiResponse<PostDetail>> {
    const formData = new FormData();
    formData.append('postData', new Blob([JSON.stringify(postData)], { type: 'application/json' }));
    
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post(COMMON_API.posts, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * API 5: Update post
   * PUT /api/v1/posts/{id}
   */
  async updatePost(id: number, postData: UpdatePostRequest): Promise<ApiResponse<PostDetail>> {
    const response = await apiClient.put(COMMON_API.postDetail(String(id)), postData);
    return response.data;
  },

  /**
   * API 6: Delete post
   * DELETE /api/v1/posts/{id}
   */
  async deletePost(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(COMMON_API.postDetail(String(id)));
    return response.data;
  },

  /**
   * API 7: Upload images to post
   * POST /api/v1/posts/{id}/images
   */
  async uploadImages(postId: number, images: File[], setThumbnail?: number): Promise<ApiResponse<{ id: number; imageUrl: string; isThumbnail: boolean }[]>> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    if (setThumbnail !== undefined) {
      formData.append('setThumbnail', String(setThumbnail));
    }

    const response = await apiClient.post(COMMON_API.postImages(postId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * API 8: Delete image from post
   * DELETE /api/v1/posts/{postId}/images/{imageId}
   */
  async deleteImage(postId: number, imageId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(COMMON_API.postImageDelete(postId, imageId));
    return response.data;
  },

  /**
   * API 9: Increment view count
   * POST /api/v1/posts/{id}/view
   */
  async increaseViews(id: number): Promise<ApiResponse<{ views: number; isNewView: boolean }>> {
    const response = await apiClient.post(COMMON_API.postView(id));
    return response.data;
  },

  /**
   * React / like post
   */
  async reactToPost(id: number, type: string = "LIKE"): Promise<ApiResponse<{ reaction?: string; reactionCount: number }>> {
    const response = await apiClient.post(COMMON_API.postReaction(id, type));
    return response.data;
  },

  /**
   * Toggle favorite/save
   */
  async toggleFavorite(id: number): Promise<ApiResponse<{ isFavorited: boolean; favoriteCount: number }>> {
    const response = await apiClient.post(COMMON_API.postFavorite(id));
    return response.data;
  },

  /**
   * Get comments for a post
   * GET /api/posts/{postId}/comments
   */
  async getComments(postId: number, page: number = 1, limit: number = 50): Promise<ApiResponse<{ comments: any[]; pagination: any }>> {
    const response = await apiClient.get(`/api/posts/${postId}/comments`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get replies for a comment
   * GET /api/comments/{commentId}/replies
   */
  async getReplies(commentId: number, page: number = 1, limit: number = 10): Promise<ApiResponse<{ comments: any[]; pagination: any }>> {
    const response = await apiClient.get(`/api/comments/${commentId}/replies`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Add comment
   */
  async addComment(postId: number, payload: { content: string; parentCommentId?: number }): Promise<ApiResponse<any>> {
    const response = await apiClient.post(COMMON_API.postComments(postId), payload);
    return response.data;
  },

  /**
   * Toggle reaction on a post
   * POST /api/v1/posts/{id}/reactions
   */
  async toggleReaction(postId: number, reactionType: string | null): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/api/v1/posts/${postId}/reactions`, {
      reactionType: reactionType || 'LIKE'
    });
    return response.data;
  },

  /**
   * API 10: Get nearby posts
   * GET /api/v1/posts/nearby
   */
  async getNearbyPosts(params: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<{ content: PostListItem[]; totalElements: number }>> {
    const response = await apiClient.get(COMMON_API.nearbyPosts, {
      params: {
        latitude: params.latitude,
        longitude: params.longitude,
        radiusKm: params.radiusKm || 5.0,
        status: params.status,
        page: params.page || 0,
        size: params.size || 10,
      },
    });
    return response.data;
  },

  /**
   * API 11: Update pet info
   * PUT /api/pets/{petId}
   */
  async updatePet(petId: number, petData: {
    name?: string;
    breed?: string;
    age?: number;
    gender?: string;
    color?: string;
    size?: string;
    weight?: number;
    personality?: string[];
    specialNeeds?: string;
    bio?: string;
    isVaccinated?: boolean;
    isNeutered?: boolean;
  }): Promise<ApiResponse<PetInfo>> {
    const response = await apiClient.put(`/api/pets/${petId}`, petData);
    return response.data;
  },

  /**
   * API 12: Update health record
   * PUT /api/v1/pets/{petId}/health
   */
  async updateHealthRecord(petId: number, healthData: {
    weight?: number;
    allergies?: string[];
    notes?: string;
    lastCheckup?: string;
  }): Promise<ApiResponse<unknown>> {
    const response = await apiClient.put(`/api/v1/pets/${petId}/health`, healthData);
    return response.data;
  },

  /**
   * API 13: Add vaccination
   * POST /api/v1/pets/{petId}/health/vaccinations
   */
  async addVaccination(petId: number, data: { name: string; date: string; nextDueDate?: string }): Promise<ApiResponse<any>> {
    // Backend expects LocalDateTime format: "2025-12-02T00:00:00"
    const formatToLocalDateTime = (dateStr: string) => dateStr ? `${dateStr}T00:00:00` : undefined;
    
    const response = await apiClient.post(`/api/v1/pets/${petId}/health/vaccinations`, {
      name: data.name,
      vaccinationDate: formatToLocalDateTime(data.date),
      nextDueDate: data.nextDueDate ? formatToLocalDateTime(data.nextDueDate) : undefined,
    });
    return response.data;
  },

  /**
   * API 14: Delete vaccination
   * DELETE /api/v1/pets/{petId}/health/vaccinations/{vaccinationId}
   */
  async deleteVaccination(petId: number, vaccinationId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/v1/pets/${petId}/health/vaccinations/${vaccinationId}`);
    return response.data;
  },

  /**
   * API 15: Add medical history
   * POST /api/v1/pets/{petId}/health/medical-history
   */
  async addMedicalHistory(petId: number, data: { condition: string; treatment: string; date: string; notes?: string; weight?: number }): Promise<ApiResponse<any>> {
    // Backend expects LocalDateTime format: "2025-12-02T00:00:00"
    const response = await apiClient.post(`/api/v1/pets/${petId}/health/medical-history`, {
      condition: data.condition,
      treatment: data.treatment,
      visitDate: data.date ? `${data.date}T00:00:00` : undefined,
      notes: data.notes,
      weight: data.weight || undefined,
    });
    return response.data;
  },

  /**
   * API 16: Delete medical history
   * DELETE /api/v1/pets/{petId}/health/medical-history/{historyId}
   */
  async deleteMedicalHistory(petId: number, historyId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/v1/pets/${petId}/health/medical-history/${historyId}`);
    return response.data;
  },
};

export default petPostService;
