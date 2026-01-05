import apiClient from '@/common/apiClient';

export interface SuggestedItem {
  id: number;
  name: string;
  avatar?: string;
  tag: string;
  type: 'ORGANIZATION' | 'USER' | 'GROUP';
  isVerified?: boolean;
  isFollowing?: boolean;
  isMember?: boolean;
  followerCount?: number;
  memberCount?: number;
}

export interface SuggestionsData {
  organizations: SuggestedItem[];
  users: SuggestedItem[];
  groups: SuggestedItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const suggestionsService = {
  /**
   * Get personalized suggestions
   * GET /api/v1/suggestions
   */
  async getSuggestions(limit: number = 5): Promise<ApiResponse<SuggestionsData>> {
    const response = await apiClient.get(`/api/v1/suggestions`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Toggle follow for an organization
   * POST /api/v1/organizations/{id}/follow
   */
  async toggleFollowOrganization(orgId: number): Promise<ApiResponse<{ isFollowing: boolean; followerCount: number }>> {
    const response = await apiClient.post(`/api/v1/organizations/${orgId}/follow`);
    return response.data;
  },

  /**
   * Check if user is following an organization
   * GET /api/v1/organizations/{id}/is-following
   */
  async isFollowingOrganization(orgId: number): Promise<ApiResponse<{ isFollowing: boolean }>> {
    const response = await apiClient.get(`/api/v1/organizations/${orgId}/is-following`);
    return response.data;
  },

  /**
   * Join a group
   * POST /api/v1/groups/{id}/join
   */
  async joinGroup(groupId: number): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/api/v1/groups/${groupId}/join`);
    return response.data;
  },

  /**
   * Leave a group
   * POST /api/v1/groups/{id}/leave
   */
  async leaveGroup(groupId: number): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`/api/v1/groups/${groupId}/leave`);
    return response.data;
  }
};

export default suggestionsService;
