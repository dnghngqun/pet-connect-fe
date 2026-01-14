import apiClient from "@/common/apiClient";

export enum RecordType {
    VACCINE = 'VACCINE',
    CHECKUP = 'CHECKUP',
    SURGERY = 'SURGERY',
    MEDICATION = 'MEDICATION',
    OTHER = 'OTHER'
}

export interface MedicalRecordDTO {
    id: number;
    petId: string;
    date: string;
    diagnosis: string;
    doctorName?: string;
    clinicName?: string;
    notes?: string;
    weight?: number;
    attachments: string[];
    type: RecordType;
}

export interface CreateMedicalRecordRequest {
    petId: string;
    date: string;
    diagnosis: string;
    doctorName?: string;
    clinicName?: string;
    notes?: string;
    weight?: number;
    attachments: string[];
    type: RecordType;
}

export interface UpdateMedicalRecordRequest {
    date?: string;
    diagnosis?: string;
    doctorName?: string;
    clinicName?: string;
    notes?: string;
    weight?: number;
    attachments?: string[];
    type?: RecordType;
}

const medicalRecordService = {
    getMedicalRecordsByPet: async (petId: string) => {
        try {
            const response = await apiClient.get<MedicalRecordDTO[]>(`/api/v1/medical-records/pet/${petId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching medical records: ", error);
            return [];
        }
    },

    createMedicalRecord: async (data: CreateMedicalRecordRequest) => {
        try {
            const response = await apiClient.post<MedicalRecordDTO>('/api/v1/medical-records', data);
            return response.data;
        } catch (error) {
            console.error("Error creating medical record: ", error);
            throw error;
        }
    },

    updateMedicalRecord: async (id: number, data: UpdateMedicalRecordRequest) => {
        try {
            const response = await apiClient.put<MedicalRecordDTO>(`/api/v1/medical-records/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating medical record: ", error);
            throw error;
        }
    },

    deleteMedicalRecord: async (id: number) => {
        try {
            await apiClient.delete(`/api/v1/medical-records/${id}`);
            return true;
        } catch (error) {
            console.error("Error deleting medical record: ", error);
            return false;
        }
    }
};

export default medicalRecordService;
