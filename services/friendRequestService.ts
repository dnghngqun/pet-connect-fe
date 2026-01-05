import apiClient from '@/common/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface FriendRequestDTO {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  senderBio?: string;
  receiverId: number;
  receiverName: string;
  receiverAvatar?: string;
  status: string;
  createdAt: string;
  respondedAt?: string;
}

export interface FriendStatusDTO {
  status: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS';
  requestId?: number;
}

const friendRequestService = {
  /**
   * Send friend request
   */
  async sendFriendRequest(receiverId: number) {
    const response = await apiClient.post('/api/v1/friend-requests/send', {
      receiverId,
    });
    return response.data;
  },

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: number) {
    const response = await apiClient.post(`/api/v1/friend-requests/${requestId}/accept`);
    return response.data;
  },

  /**
   * Reject friend request
   */
  async rejectFriendRequest(requestId: number) {
    const response = await apiClient.post(`/api/v1/friend-requests/${requestId}/reject`);
    return response.data;
  },

  /**
   * Cancel sent friend request
   */
  async cancelFriendRequest(requestId: number) {
    const response = await apiClient.delete(`/api/v1/friend-requests/${requestId}/cancel`);
    return response.data;
  },

  /**
   * Get pending requests (received)
   */
  async getPendingRequests() {
    const response = await apiClient.get('/api/v1/friend-requests/pending');
    return response.data;
  },

  /**
   * Get sent requests
   */
  async getSentRequests() {
    const response = await apiClient.get('/api/v1/friend-requests/sent');
    return response.data;
  },

  /**
   * Get friend status with user
   */
  async getFriendStatus(userId: number): Promise<{ success: boolean; data: FriendStatusDTO }> {
    const response = await apiClient.get(`/api/v1/friend-requests/status/${userId}`);
    return response.data;
  },

  /**
   * Count pending requests
   */
  async countPendingRequests() {
    const response = await apiClient.get('/api/v1/friend-requests/count');
    return response.data;
  },

  /**
   * Get friends of a user
   */
  async getUserFriends(userId: number | string, page = 0, size = 20) {
    const response = await apiClient.get(`/api/v1/friendships/${userId}/list`, {
      params: { page, size },
    });
    return response.data;
  },
};

export default friendRequestService;
