import apiClient from "@/common/apiClient";

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender: string;
  bio?: string;
  profilePhoto?: string;
  isCastrated?: boolean;
  weight?: number;
  birthday?: string;
}

export interface CreatePetRequest {
  name: string;
  species: string;
  breed?: string;
  gender: string; // MALE, FEMALE
  bio?: string;
  avatar?: File | null;
}

const petService = {
  // Get all pets for current user
  getMyPets: async () => {
    try {
      const response = await apiClient.get('/api/v1/pets');
      return { success: true, data: response.data.data.content || response.data.data || [] };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch pets',
      };
    }
  },

  // Create a new pet
  createPet: async (data: CreatePetRequest) => {
    // Note: Creating pet usually involves JSON data + potential file upload separately or multipart
    // Based on previous AddPetModal implementation, it calls /api/v1/pets with JSON
    // If we want to use this service, we should align. For now correcting the endpoint path.
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('species', data.species);
    formData.append('gender', data.gender);
    if (data.breed) formData.append('breed', data.breed);
    if (data.bio) formData.append('bio', data.bio);
    if (data.avatar) formData.append('file', data.avatar);

    try {
      const response = await apiClient.post('/api/v1/pets', formData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create pet',
      };
    }
  },

  // Get pet detail
  getPetById: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/v1/pets/${id}`);
      return { success: true, data: response.data?.data || response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch pet details',
      };
    }
  },
  
  // Update pet
  updatePet: async (id: number, data: any) => {
     try {
      const response = await apiClient.put(`/api/v1/pets/${id}`, data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update pet',
      };
    }
  }
};

export default petService;
