import { COMMON_API } from '@/common/Constant/COMMON_API';
import apiClient from "@/common/apiClient";

export const login = async (email: string, password: string) => {
  const response = await apiClient.post(COMMON_API.login, { email, password });

  if (response.data?.data?.token) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const register = async (email: string, password: string) => {
  const response = await apiClient.post(COMMON_API.register, { email, password });
  return response.data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export default {
  login,
  logout,
  register,
  getCurrentUser,
};
