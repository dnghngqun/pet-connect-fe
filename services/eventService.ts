import apiClient from '@/common/apiClient';

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  city: string;
  district: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  createdBy: {
    id: number;
    fullName: string;
    avatarUrl: string;
  };
  groupId?: number;
  groupName?: string;
  groupAvatar?: string;
  participantCount: number;
  isParticipating: boolean;
}

const eventService = {
  /**
   * Get upcoming events
   * GET /api/v1/events
   */
  getUpcomingEvents: async (page = 0, size = 10) => {
    try {
      const response = await apiClient.get('/api/v1/events', {
        params: { page, size },
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch events',
      };
    }
  },
};

export default eventService;
