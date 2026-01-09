
import { COMMON_API } from '@/common/Constant/COMMON_API';
import apiClient from '@/common/apiClient';
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
export interface CampaignListItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
  relatedPet: {
    id: number;
    name: string;
    image: string | null;
  } | null;
  donorCount: number;
  progress: number;
}
export interface CampaignDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  descriptionDetailed: string | null;
  image: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  beneficiary: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  relatedPet: {
    id: number;
    name: string;
    type: string;
    image: string | null;
  } | null;
  updates: CampaignUpdate[];
  donorCount: number;
  progress: number;
}
export interface CampaignUpdate {
  id: number;
  title: string;
  content: string;
  images: string[] | null;
  createdAt: string;
}
export interface DonationItem {
  id: number;
  amount: number;
  message: string | null;
  isAnonymous: boolean;
  donor: {
    id: number;
    name: string;
    avatarUrl: string | null;
  } | null;
  createdAt: string;
}

export interface GetCampaignsParams {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface DonateRequest {
  amount: number;
  message?: string;
  isAnonymous?: boolean;
  paymentMethod: 'MOMO' | 'ZALOPAY' | 'BANK' | 'CARD';
}

export interface CreateCampaignRequest {
  title: string;
  description: string;
  descriptionDetailed?: string;
  category: string;
  targetAmount: number;
  currency?: string;
  beneficiary?: string;
  startDate: string;
  endDate?: string;
  relatedPetId?: number;
}

export interface AddCampaignUpdateRequest {
  title: string;
  content: string;
}

const fundraisingService = {
  /**
   * API 1: Get campaigns list
   * GET /api/v1/fundraising/campaigns
   */
  async getCampaigns(params: GetCampaignsParams = {}): Promise<ApiResponse<PaginatedResponse<CampaignListItem>>> {
    const response = await apiClient.get(COMMON_API.fundraisingCampaigns, {
      params: {
        status: params.status,
        category: params.category,
        search: params.search,
        page: params.page || 0,
        size: params.size || 10,
        sort: params.sort || 'createdAt,desc',
      },
    });
    return response.data;
  },

  /**
   * API 2: Get campaign detail
   * GET /api/v1/fundraising/campaigns/{idOrSlug}
   */
  async getCampaignDetail(idOrSlug: string): Promise<ApiResponse<CampaignDetail>> {
    const response = await apiClient.get(COMMON_API.fundraisingCampaignDetail(idOrSlug));
    return response.data;
  },

  /**
   * API 3: Create campaign
   * POST /api/v1/fundraising/campaigns
   */
  async createCampaign(campaignData: CreateCampaignRequest, image: File): Promise<ApiResponse<CampaignDetail>> {
    const formData = new FormData();
    formData.append('campaignData', new Blob([JSON.stringify(campaignData)], { type: 'application/json' }));
    formData.append('image', image);

    const response = await apiClient.post(COMMON_API.fundraisingCampaigns, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * API 4: Donate to campaign
   * POST /api/v1/fundraising/campaigns/{id}/donate
   */
  async donate(campaignId: number, data: DonateRequest): Promise<ApiResponse<{ donationId: number; paymentUrl: string }>> {
    const response = await apiClient.post(COMMON_API.fundraisingDonate(campaignId), data);
    return response.data;
  },

  /**
   * API 5: Get campaign donations
   * GET /api/v1/fundraising/campaigns/{id}/donations
   */
  async getCampaignDonations(campaignId: number, page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<DonationItem>>> {
    const response = await apiClient.get(COMMON_API.fundraisingDonations(campaignId), {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * API 6: Add campaign update
   * POST /api/v1/fundraising/campaigns/{id}/updates
   */
  async addCampaignUpdate(campaignId: number, data: AddCampaignUpdateRequest, images?: File[]): Promise<ApiResponse<CampaignUpdate>> {
    const formData = new FormData();
    formData.append('updateData', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post(COMMON_API.fundraisingUpdates(campaignId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default fundraisingService;
