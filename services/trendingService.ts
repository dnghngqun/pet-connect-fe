import apiClient from '@/common/apiClient';

export interface TrendingStats {
  id: number;
  hashtag: string;
  searchCount: number;
  viewCount: number;
  postCount: number;
  lastUpdated: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const trendingService = {
  /**
   * Get top trending hashtags
   * GET /api/v1/trending
   */
  async getTrending(limit: number = 5): Promise<ApiResponse<TrendingStats[]>> {
    const response = await apiClient.get('/api/v1/trending', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Track search keyword
   * POST /api/v1/trending/track/search
   */
  async trackSearch(keyword: string): Promise<void> {
    if (!keyword || !keyword.trim()) return;
    await apiClient.post('/api/v1/trending/track/search', null, {
      params: { keyword: keyword.trim() }
    });
  },

  /**
   * Track post view
   * POST /api/v1/trending/track/view/{postId}
   */
  async trackView(postId: string): Promise<void> {
    await apiClient.post(`/api/v1/trending/track/view/${postId}`);
  }
};

export default trendingService;
