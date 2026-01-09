import apiClient from '@/common/apiClient';
import { COMMON_API } from '@/common/Constant/COMMON_API';
import { AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http:

export const getProfile = async () => {
  const resp = await apiClient.get(COMMON_API.profile);
  return resp.data;
};

/**
 * Get user profile by ID (new social media feature)
 */
export const getUserProfile = async (userId: string) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}/profile`);
    return response.data;
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
    const params = {
      page: page.toString(),
      size: size.toString(),
      ...(status && { status }),
    };
    

    const response = await apiClient.get(`/api/v1/posts/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

/**
 * Search users by name
 */
export const searchUsers = async (query: string) => {
  try {
    const response = await apiClient.get(`/api/users/search`, {
      params: { name: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Upload cover photo for current user
 */
export const uploadCoverPhoto = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/api/users/me/cover-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    throw error;
  }
};

export default {
  getProfile,
  getUserProfile,
  getUserPosts,
  searchUsers,
  uploadCoverPhoto,
};
