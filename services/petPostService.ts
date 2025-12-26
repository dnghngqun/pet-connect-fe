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
  profilePhoto: string | null;
  photos: string[];
  qrCodeUrl: string | null;
  healthRecord: {
    id: number;
    allergies: string[];
    notes: string | null;
    lastCheckup: string | null;
    vaccinations: { name: string; date: string; nextDue?: string }[];
    medicalHistory: { date: string; condition: string; treatment: string; notes?: string }[];
    weightHistory: { date: string; value: number }[];
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
  message: string;
  data: T;
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
  featured?: boolean;
  sort?: string;
}

export interface CreatePostRequest {
  title: string;
  description: string;
  petType: string;
  status: string;
  city: string;
  district: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  petId?: number;
}

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  status?: string;
  city?: string;
  district?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  isActive?: boolean;
}

// ============ Service Functions ============

const petPostService = {
  /**
   * API 1: Get posts list with filters
   * GET /api/v1/posts
   */
  async getPosts(params: GetPostsParams = {}): Promise<ApiResponse<PaginatedResponse<PostListItem>>> {
    const response = await apiClient.get(COMMON_API.posts, {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        status: params.status,
        petType: params.petType,
        city: params.city,
        district: params.district,
        search: params.search,
        featured: params.featured,
        sort: params.sort || 'createdAt,desc',
      },
    });
    return response.data;
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
  async getMyPosts(params: { status?: string; isActive?: boolean; page?: number; size?: number } = {}): Promise<ApiResponse<PaginatedResponse<PostListItem>>> {
    const response = await apiClient.get(COMMON_API.myPosts, {
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
};

export default petPostService;
