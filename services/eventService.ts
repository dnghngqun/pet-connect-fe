import apiClient from "@/common/apiClient";

export interface Event {
    id: number;
    title: string;
    description: string;
    location: string;
    city: string;
    district: string;
    latitude?: number;
    longitude?: number;
    coverImageUrl?: string;
    price?: number;
    startAt: string;
    endAt?: string;
    isPrivate: boolean;
    createdAt: string;
    createdBy: {
        id: number;
        fullName: string;
        avatarUrl?: string;
    };
    groupId?: number;
    groupName?: string;
    groupAvatar?: string;
    participantCount: number;
    isParticipating: boolean;
}

export interface Comment {
    id: number;
    eventId: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    petId?: number;
    petName?: string;
    petAvatar?: string;
    content: string;
    parentCommentId?: number;
    depth: number;
    likes: number | 0;
    createdAt: string;
    replies?: Comment[];
    replyCount?: number;
    isLiked?: boolean;
}

export const eventService = {
    toggleLike: async (commentId: number) => {
        const response = await apiClient.post(`/api/comments/${commentId}/reaction`);
        return response.data.data;
    },
    getUpcomingEvents: async (page = 0, size = 10, petId?: number) => {
        const params = petId ? `&petId=${petId}` : '';
        const response = await apiClient.get(`/api/v1/events?page=${page}&size=${size}${params}`);
        return response.data.data;
    },

    getEventById: async (id: number, petId?: number) => {
        const params = petId ? `?petId=${petId}` : '';
        const response = await apiClient.get(`/api/v1/events/${id}${params}`);
        return response.data.data;
    },

    createEvent: async (data: any) => {
        const response = await apiClient.post("/api/v1/events", data);
        return response.data;
    },

    joinEvent: async (eventId: number, petId: number) => {
        const response = await apiClient.post(`/api/v1/events/${eventId}/join?petId=${petId}`);
        return response.data;
    },

    leaveEvent: async (eventId: number, petId: number) => {
        const response = await apiClient.post(`/api/v1/events/${eventId}/leave?petId=${petId}`);
        return response.data;
    },

    deleteEvent: async (eventId: number) => {
        const response = await apiClient.delete(`/api/v1/events/${eventId}`);
        return response.data;
    },

    getComments: async (eventId: number, page = 0, size = 10) => {
        const response = await apiClient.get(`/api/v1/events/${eventId}/comments?page=${page}&size=${size}`);
        return response.data.data;
    },

    addComment: async (eventId: number, data: { content: string; parentCommentId?: number; petId?: number }) => {
        const response = await apiClient.post(`/api/v1/events/${eventId}/comments`, data);
        return response.data.data;
    }
};

export default eventService;
