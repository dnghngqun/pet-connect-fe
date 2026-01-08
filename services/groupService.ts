import apiClient from '@/common/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper to get token from user storage (fixes auth issue)
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('pet-connect-user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user?.token || null;
  } catch {
    return null;
  }
};

export interface Group {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: 'BREED' | 'LOCATION' | 'INTEREST' | 'ACTIVITY' | 'OTHER';
  avatarUrl?: string;
  coverImageUrl?: string;
  isPrivate: boolean;
  city?: string;
  district?: string;
  memberCount: number;
  postCount: number;
  rules?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  creatorId: number;
  creatorName: string;
  creatorAvatar?: string;
  isMember: boolean;
  memberRole?: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'PENDING';
  joinedAt?: string;
  admins?: GroupMember[];
  recentMembers?: GroupMember[];
}

export interface GroupMember {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'PENDING';
  joinedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  category?: 'BREED' | 'LOCATION' | 'INTEREST' | 'ACTIVITY' | 'OTHER';
  isPrivate?: boolean;
  city?: string;
  district?: string;
  rules?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  category?: 'BREED' | 'LOCATION' | 'INTEREST' | 'ACTIVITY' | 'OTHER';
  isPrivate?: boolean;
  city?: string;
  district?: string;
  rules?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
}

/**
 * Get all groups with filters
 */
export const getGroups = async (params: {
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  size?: number;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.city) queryParams.append('city', params.city);
    if (params.search) queryParams.append('search', params.search);
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 20).toString());

    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/v1/groups?${queryParams}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

/**
 * Get group by slug
 */
export const getGroupBySlug = async (slug: string) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/v1/groups/${slug}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching group:', error);
    throw error;
  }
};

/**
 * Create a new group
 */
export const createGroup = async (request: CreateGroupRequest) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/v1/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

/**
 * Update group
 */
export const updateGroup = async (groupId: number, request: UpdateGroupRequest) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/v1/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

/**
 * Delete group
 */
export const deleteGroup = async (groupId: number) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/v1/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

/**
 * Join a group
 */
export const joinGroup = async (groupId: number) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/v1/groups/${groupId}/join`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

/**
 * Leave a group
 */
export const leaveGroup = async (groupId: number) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/v1/groups/${groupId}/leave`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

/**
 * Get group members
 */
export const getGroupMembers = async (groupId: number, page = 0, size = 20) => {
  try {
    const token = getToken();
    
    const response = await fetch(
      `${API_URL}/api/v1/groups/${groupId}/members?page=${page}&size=${size}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
};

/**
 * Get user's groups
 */
export const getMyGroups = async (page = 0, size = 20) => {
  try {
    const token = getToken();
    
    const response = await fetch(
      `${API_URL}/api/v1/groups/my-groups?page=${page}&size=${size}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching my groups:', error);
    throw error;
  }
};

/**
 * Get popular groups
 */
export const getPopularGroups = async (limit = 10) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/v1/groups/popular?limit=${limit}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching popular groups:', error);
    throw error;
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (
  groupId: number,
  memberId: number,
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER'
) => {
  try {
    const token = getToken();
    
    const response = await fetch(
      `${API_URL}/api/v1/groups/${groupId}/members/${memberId}/role`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ role }),
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

/**
 * Remove member from group
 */
export const removeMember = async (groupId: number, userId: number) => {
  try {
    const token = getToken();
    
    const response = await fetch(
      `${API_URL}/api/v1/groups/${groupId}/members/${userId}`,
      {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

/**
 * Get pending join requests for a group (admin only)
 */
export const getPendingMembers = async (groupId: number) => {
  try {
    const token = getToken();
    
    const response = await fetch(
      `${API_URL}/api/v1/groups/${groupId}/pending-members`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pending members:', error);
    throw error;
  }
};

/**
 * Approve a pending member request (admin only)
 */
export const approveMember = async (groupId: number, userId: number) => {
  try {
    const token = getToken();
    
    const response = await fetch(
      `${API_URL}/api/v1/groups/${groupId}/members/${userId}/approve`,
      {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error approving member:', error);
    throw error;
  }
};

/**
 * Reject a pending member request (admin only)
 */
export const rejectMember = async (groupId: number, userId: number) => {
  try {
    const token = getToken();
    
    const response = await fetch(
      `${API_URL}/api/v1/groups/${groupId}/members/${userId}/reject`,
      {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error rejecting member:', error);
    throw error;
  }
};

export default {
  getGroups,
  getGroupBySlug,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  getMyGroups,
  getPopularGroups,
  updateMemberRole,
  removeMember,
  getPendingMembers,
  approveMember,
  rejectMember,
};

