import { COMMON_API } from '@/common/Constant/COMMON_API';
import apiClient from "@/common/apiClient";

// Default avatar URLs for users without avatars
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user8',
];

const getRandomDefaultAvatar = (): string => {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
};

export const login = async (email: string, password: string) => {
  const response = await apiClient.post(COMMON_API.login, { email, password });

  if (response.data?.data?.token) {
    const userData = response.data.data;
    // If avatarUrl is null, assign a random default avatar
    if (!userData.avatarUrl) {
      userData.avatarUrl = getRandomDefaultAvatar();
    }
    localStorage.setItem('pet-connect-user', JSON.stringify(userData));
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem('pet-connect-user');
};

export const register = async (fullName: string, phoneNumber: string, email: string, password: string) => {
  const response = await apiClient.post(COMMON_API.register, {fullName, phoneNumber, email, password });

  // Auto login after successful registration
  if (response.data?.data?.token) {
    const userData = response.data.data;
    if (!userData.avatarUrl) {
      userData.avatarUrl = getRandomDefaultAvatar();
    }
    localStorage.setItem('pet-connect-user', JSON.stringify(userData));
  }

  return response.data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('pet-connect-user');
  return user ? JSON.parse(user) : null;
};

export default {
  login,
  logout,
  register,
  getCurrentUser,
};
