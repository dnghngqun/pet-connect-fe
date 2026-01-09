
import { COMMON_API } from '@/common/Constant/COMMON_API';
import apiClient from '@/common/apiClient';
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

const locationService = {
  /**
   * API 11: Get list of cities
   * GET /api/v1/locations/cities
   */
  async getCities(): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get(COMMON_API.cities);
    return response.data;
  },

  /**
   * API 12: Get list of districts for a city
   * GET /api/v1/locations/districts?city={city}
   */
  async getDistricts(city: string): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get(COMMON_API.districts, {
      params: { city },
    });
    return response.data;
  },
};

export default locationService;
