// Nearby Service - Real API calls
// Based on PostController.java (API 10) and MapController.java

import { COMMON_API } from '@/common/Constant/COMMON_API';
import apiClient from '@/common/apiClient';
import { PostListItem, ApiResponse } from './petPostService';

// ============ Types based on backend DTOs ============

// MapLocationDTO
export interface MapLocation {
  posts: MapPostItem[];
  rescueCenters: MapRescueCenterItem[];
}

export interface MapPostItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  petType: string;
  image: string;
  latitude: number;
  longitude: number;
}

export interface MapRescueCenterItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  rating: number | null;
}

// ============ Request Types ============

export interface GetNearbyPostsParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  status?: string;
  page?: number;
  size?: number;
}

export interface GetMapLocationsParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  types?: 'posts' | 'rescue_centers' | 'all';
}

// ============ Service Functions ============

const nearbyService = {
  /**
   * API 10 from PostController: Get nearby posts
   * GET /api/v1/posts/nearby
   */
  async getNearbyPosts(params: GetNearbyPostsParams): Promise<ApiResponse<{ content: PostListItem[]; totalElements: number }>> {
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
   * API 4 from MapController: Get map data (posts + rescue centers)
   * GET /api/v1/map/locations
   */
  async getMapLocations(params: GetMapLocationsParams): Promise<ApiResponse<MapLocation>> {
    const response = await apiClient.get(COMMON_API.mapLocations, {
      params: {
        latitude: params.latitude,
        longitude: params.longitude,
        radiusKm: params.radiusKm || 20.0,
        types: params.types || 'all',
      },
    });
    return response.data;
  },
};

export default nearbyService;
