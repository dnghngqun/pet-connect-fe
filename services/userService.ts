import apiClient from '@/common/apiClient';
import { COMMON_API } from '@/common/Constant/COMMON_API';

export const getProfile = async () => {
  const resp = await apiClient.get(COMMON_API.profile);
  return resp.data;
};

export default {
  getProfile,
};
