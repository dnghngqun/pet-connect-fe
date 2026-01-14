import apiClient from '@/common/apiClient';
import { PetPost } from '@/lib/types';
import { Group } from './groupService';
import { Event } from './eventService';
import { Pet } from './petService';

export interface UserResult {
  id: number;
  fullName: string;
  avatarUrl: string;
}

export interface SearchResponse {
  users: UserResult[];
  posts: PetPost[]; // Note: PostListItemDTO structure from backend matches PetPost roughly
  groups: Group[];
  events: Event[];
  pets: Pet[];
}

const searchService = {
  search: async (query: string): Promise<{ success: boolean; data: SearchResponse, message?: string }> => {
    try {
      const response = await apiClient.get(`/api/v1/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      return { 
        success: false, 
        data: { users: [], posts: [], groups: [], events: [], pets: [] },
        message: 'Search failed'
      };
    }
  },
};

export default searchService;
