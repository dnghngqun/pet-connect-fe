import apiClient from '@/common/apiClient';
import { COMMON_API } from '@/common/Constant/COMMON_API';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const getProfile = async () => {
  const resp = await apiClient.get(COMMON_API.profile);
  return resp.data;
};

/**
 * Get user profile by ID (new social media feature)
 */
export const getUserProfile = async (userId: string) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('pet-connect-token') : null;
    
    const response = await fetch(`${API_URL}/api/users/${userId}/profile`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    return response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Get posts by a specific user
 */
export const getUserPosts = async (userId: string, page = 0, size = 10, status?: string) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(status && { status }),
    });
    
    const response = await fetch(`${API_URL}/api/v1/posts/user/${userId}?${params}`);
    return response.json();
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export default {
  getProfile,
  getUserProfile,
  getUserPosts,
};
