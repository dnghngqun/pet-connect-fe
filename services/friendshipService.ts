import apiClient from '@/common/apiClient';
import { COMMON_API } from '@/common/Constant/COMMON_API';

export interface Friendship {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  userBio?: string;
  userCity?: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  createdAt: string;
  acceptedAt?: string;
  mutualFriendsCount?: number;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  senderBio?: string;
  senderCity?: string;
  createdAt: string;
  mutualFriendsCount?: number;
}

/**
 * Send friend request
 */
export const sendFriendRequest = async (toUserId: number) => {
  try {
    const response = await apiClient.post('/api/v1/friendships/request', { toUserId });
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

/**
 * Accept friend request
 */
export const acceptFriendRequest = async (requestId: number) => {
  try {
    const response = await apiClient.post(`/api/v1/friendships/${requestId}/accept`);
    return response.data;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

/**
 * Reject friend request
 */
export const rejectFriendRequest = async (requestId: number) => {
  try {
    const response = await apiClient.post(`/api/v1/friendships/${requestId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

/**
 * Unfriend
 */
export const unfriend = async (friendId: number) => {
  try {
    const response = await apiClient.delete(`/api/v1/friendships/${friendId}`);
    return response.data;
  } catch (error) {
    console.error('Error unfriending:', error);
    throw error;
  }
};

/**
 * Get friends list
 */
export const getFriends = async (page = 0, size = 20) => {
  try {
    const response = await apiClient.get('/api/v1/friendships/friends', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

/**
 * Get pending requests
 */
export const getPendingRequests = async (page = 0, size = 20) => {
  try {
    const response = await apiClient.get('/api/v1/friendships/requests', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

/**
 * Get friend suggestions
 */
export const getFriendSuggestions = async (limit = 10) => {
  try {
    const response = await apiClient.get('/api/v1/friendships/suggestions', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw error;
  }
};

/**
 * Get mutual friends
 */
export const getMutualFriends = async (userId: number) => {
  try {
    const response = await apiClient.get(`/api/v1/friendships/mutual/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mutual friends:', error);
    throw error;
  }
};

export default {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  getFriends,
  getPendingRequests,
  getFriendSuggestions,
  getMutualFriends,
};
