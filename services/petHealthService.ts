
import { COMMON_API } from '@/common/Constant/COMMON_API';
import apiClient from '@/common/apiClient';
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
export interface Vaccination {
  id: number;
  name: string;
  date: string;
  nextDue: string | null;
  veterinarian: string | null;
  notes: string | null;
}
export interface MedicalHistory {
  id: number;
  date: string;
  condition: string;
  treatment: string;
  veterinarian: string | null;
  notes: string | null;
}
export interface WeightTracking {
  id: number;
  date: string;
  weight: number;
  notes: string | null;
}
export interface VaccinationReminder {
  id: number;
  vaccinationName: string;
  dueDate: string;
  petName: string;
  petId: number;
  daysUntilDue: number;
}
export interface HealthRecordSummary {
  id: number;
  lastCheckup: string | null;
  weight: number | null;
  allergies: string[];
  notes: string | null;
  vaccinations: Vaccination[];
  medicalHistory: MedicalHistory[];
  weightTracking: WeightTracking[];
}
export interface PetHealthProfile {
  pet: {
    id: number;
    name: string;
    type: string;
    breed: string | null;
    age: number | null;
    gender: string | null;
    profilePhoto: string | null;
    qrCodeUrl: string | null;
  };
  healthRecord: HealthRecordSummary;
}

export interface UpdateHealthRecordRequest {
  allergies?: string[];
  notes?: string;
  lastCheckup?: string;
}

export interface AddVaccinationRequest {
  name: string;
  date: string;
  nextDue?: string;
  veterinarian?: string;
  notes?: string;
}

export interface AddMedicalHistoryRequest {
  date: string;
  condition: string;
  treatment: string;
  veterinarian?: string;
  notes?: string;
}

export interface AddWeightTrackingRequest {
  date: string;
  weight: number;
  notes?: string;
}

const petHealthService = {
  /**
   * API 1: Get pet health profile
   * GET /api/v1/pets/{petId}/health
   */
  async getHealthProfile(petId: number): Promise<ApiResponse<PetHealthProfile>> {
    const response = await apiClient.get(COMMON_API.petHealth(petId));
    return response.data;
  },

  /**
   * API 2: Update health record
   * PUT /api/v1/pets/{petId}/health
   */
  async updateHealthRecord(petId: number, data: UpdateHealthRecordRequest): Promise<ApiResponse<HealthRecordSummary>> {
    const response = await apiClient.put(COMMON_API.petHealth(petId), data);
    return response.data;
  },

  /**
   * API 3: Add vaccination
   * POST /api/v1/pets/{petId}/health/vaccinations
   */
  async addVaccination(petId: number, data: AddVaccinationRequest): Promise<ApiResponse<Vaccination>> {
    const response = await apiClient.post(COMMON_API.petVaccinations(petId), data);
    return response.data;
  },

  /**
   * API 4: Add medical history
   * POST /api/v1/pets/{petId}/health/medical-history
   */
  async addMedicalHistory(petId: number, data: AddMedicalHistoryRequest): Promise<ApiResponse<MedicalHistory>> {
    const response = await apiClient.post(COMMON_API.petMedicalHistory(petId), data);
    return response.data;
  },

  /**
   * API 5: Add weight tracking
   * POST /api/v1/pets/{petId}/health/weight
   */
  async addWeightTracking(petId: number, data: AddWeightTrackingRequest): Promise<ApiResponse<WeightTracking>> {
    const response = await apiClient.post(COMMON_API.petWeight(petId), data);
    return response.data;
  },

  /**
   * API 6: Get upcoming vaccinations
   * GET /api/v1/pets/{petId}/health/vaccinations/upcoming
   */
  async getUpcomingVaccinations(petId: number, days = 30): Promise<ApiResponse<VaccinationReminder[]>> {
    const response = await apiClient.get(COMMON_API.petVaccinationsUpcoming(petId), {
      params: { days },
    });
    return response.data;
  },

  /**
   * API 7: Get pet QR code (returns image bytes)
   * GET /api/v1/pets/{petId}/qr-code
   */
  async getPetQRCode(petId: number): Promise<Blob> {
    const response = await apiClient.get(COMMON_API.petQRCode(petId), {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default petHealthService;
