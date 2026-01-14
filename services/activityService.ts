import apiClient from "@/common/apiClient";
import { ApiResponse } from "./petPostService";
import { COMMON_API } from "@/common/Constant/COMMON_API";

export enum ActivityType {
    MEDICAL = 'MEDICAL',
    VACCINATION = 'VACCINATION',
    DEWORMING = 'DEWORMING',
    PLAY = 'PLAY',
    BIRTHDAY = 'BIRTHDAY',
    OTHER = 'OTHER'
}

export interface ActivityDTO {
    id: number;
    userId: number;
    petId?: number;
    petName?: string;
    petAvatar?: string;
    title: string;
    description?: string;
    type: ActivityType;
    startTime: string; // ISO
    endTime?: string; // ISO
    location?: string;
    isCompleted: boolean;
    hasReminder?: boolean;
    createdAt: string;
}

export interface CreateActivityRequest {
    title: string;
    description?: string;
    type: ActivityType;
    startTime: string; // ISO string
    endTime?: string; // ISO string
    location?: string;
    petId?: number;
    hasReminder?: boolean;
}

export interface UpdateActivityRequest {
    title?: string;
    description?: string;
    type?: ActivityType;
    startTime?: string;
    endTime?: string;
    location?: string;
    isCompleted?: boolean;
    petId?: number;
    hasReminder?: boolean;
}

const activityService = {
    getActivities: async (month?: number, year?: number) => {
        const params: any = {};
        if (month) params.month = month;
        if (year) params.year = year;
        const response = await apiClient.get<ApiResponse<ActivityDTO[]>>(COMMON_API.activities, { params });
        return response.data;
    },

    createActivity: async (data: CreateActivityRequest) => {
        const response = await apiClient.post<ApiResponse<ActivityDTO>>(COMMON_API.activities, data);
        return response.data;
    },

    updateActivity: async (id: number, data: UpdateActivityRequest) => {
        const response = await apiClient.put<ApiResponse<ActivityDTO>>(`${COMMON_API.activities}/${id}`, data);
        return response.data;
    },

    deleteActivity: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<void>>(`${COMMON_API.activities}/${id}`);
        return response.data;
    }
};

export default activityService;
