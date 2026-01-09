// Rescue Center Service - Real API calls
// Based on RescueCenterController.java endpoints

import { COMMON_API } from '@/common/Constant/COMMON_API';
import apiClient from '@/common/apiClient';

// ============ Types based on backend DTOs ============

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// Paginated response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

// LocationDTO
export interface Location {
  address: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
}

// RescueCenterListItemDTO
export interface RescueCenterListItem {
  id: number;
  name: string;
  location: Location;
  phone: string;
  email: string | null;
  website: string | null;
  hours: string | null;
  specialties: string[];
  rating: number | null;
  reviewCount: number;
  distance: number | null; // km (only if lat/lon provided)
  isVerified: boolean;
}

// RescueCenterDetailDTO
export interface RescueCenterDetail extends RescueCenterListItem {
  description: string | null;
  services: string[];
  images: string[];
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  } | null;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

// ReviewDTO
export interface Review {
  id: number;
  rating: number;
  comment: string;
  user: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
  createdAt: string;
}

// ============ Request Types ============

export interface GetRescueCentersParams {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  city?: string;
  specialty?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AddReviewRequest {
  rating: number;
  comment: string;
}

// ============ Service Functions ============

const rescueCenterService = {
  /**
   * API 2: Get rescue centers list
   * GET /api/v1/rescue-centers
   */
  async getRescueCenters(params: GetRescueCentersParams = {}): Promise<ApiResponse<PaginatedResponse<RescueCenterListItem>>> {
    const response = await apiClient.get(COMMON_API.rescueCenters, {
      params: {
        latitude: params.latitude,
        longitude: params.longitude,
        radiusKm: params.radiusKm || 15.0,
        city: params.city,
        specialty: params.specialty,
        page: params.page || 0,
        size: params.size || 10,
        sort: params.sort || 'distance',
      },
    });
    return response.data;
  },

  /**
   * API 3: Get rescue center detail
   * GET /api/v1/rescue-centers/{id}
   */
  async getRescueCenterDetail(id: number): Promise<ApiResponse<RescueCenterDetail>> {
    const response = await apiClient.get(COMMON_API.rescueCenterDetail(id));
    return response.data;
  },

  /**
   * API 5: Add review for rescue center
   * POST /api/v1/rescue-centers/{id}/reviews
   */
  async addReview(centerId: number, data: AddReviewRequest): Promise<ApiResponse<Review>> {
    const response = await apiClient.post(COMMON_API.rescueCenterReviews(centerId), data);
    return response.data;
  },
};

export default rescueCenterService;
