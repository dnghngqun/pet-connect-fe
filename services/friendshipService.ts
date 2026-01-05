import apiClient from '@/common/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
    const token = localStorage.getItem('pet-connect-token');
    
    const response = await fetch(`${API_URL}/api/v1/friendships/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ toUserId }),
    });
    
    const data = await response.json();
    return data;
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
    const token = localStorage.getItem('pet-connect-token');
    
    const response = await fetch(`${API_URL}/api/v1/friendships/${requestId}/accept`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    return data;
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
    const token = localStorage.getItem('pet-connect-token');
    
    const response = await fetch(`${API_URL}/api/v1/friendships/${requestId}/reject`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    return data;
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
    const token = localStorage.getItem('pet-connect-token');
    
    const response = await fetch(`${API_URL}/api/v1/friendships/${friendId}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    return data;
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
    const token = localStorage.getItem('pet-connect-token');
    
    const response = await fetch(
      `${API_URL}/api/v1/friendships/friends?page=${page}&size=${size}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
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
    const token = localStorage.getItem('pet-connect-token');
    
    const response = await fetch(
      `${API_URL}/api/v1/friendships/requests?page=${page}&size=${size}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
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
    const token = localStorage.getItem('pet-connect-token');
    
    const response = await fetch(
      `${API_URL}/api/v1/friendships/suggestions?limit=${limit}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
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
    const token = localStorage.getItem('pet-connect-token');
    
    const response = await fetch(
      `${API_URL}/api/v1/friendships/mutual/${userId}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
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
