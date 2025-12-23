// Pet Post Service - Fake API with mock data

import { petPosts } from '@/lib/pet-posts';
import type { PetPost } from '@/lib/types';

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage for posts
let localPosts = [...petPosts];
let nextPostId = 100;

export interface CreatePostData {
  title: string;
  description: string;
  petType: string;
  status: 'LOST' | 'FOUND' | 'FOR_ADOPTION' | 'RESCUE';
  city: string;
  district?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  tags?: string[];
  // Pet info (optional - for linking existing pet or creating new)
  petId?: string;
  petName?: string;
  petBreed?: string;
  petAge?: number;
  petGender?: 'MALE' | 'FEMALE';
  petColor?: string;
  petSize?: 'SMALL' | 'MEDIUM' | 'LARGE';
}

export interface UpdatePostData extends Partial<CreatePostData> {
  isActive?: boolean;
}

// Helper to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now();
}

const petPostService = {
  // Get all posts with filters
  async getPosts(filters?: {
    status?: string;
    petType?: string;
    city?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: PetPost[]; totalElements: number; totalPages: number }> {
    await delay(300);
    
    let filtered = [...localPosts];
    
    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters?.petType) {
      filtered = filtered.filter(p => 
        p.petType.toLowerCase().includes(filters.petType!.toLowerCase())
      );
    }
    if (filters?.city) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }
    
    const page = filters?.page || 0;
    const size = filters?.size || 10;
    const start = page * size;
    const end = start + size;
    
    return {
      content: filtered.slice(start, end),
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    };
  },

  // Get post by ID
  async getPostById(id: string): Promise<PetPost | null> {
    await delay(200);
    return localPosts.find(p => p.id === id) || null;
  },

  // Get post by slug
  async getPostBySlug(slug: string): Promise<PetPost | null> {
    await delay(200);
    return localPosts.find(p => p.slug === slug) || null;
  },

  // Get my posts (current user's posts)
  async getMyPosts(): Promise<PetPost[]> {
    await delay(300);
    // Mock: return posts from user1
    return localPosts.filter(p => p.postedBy.id === 'user1');
  },

  // Create new post
  async createPost(data: CreatePostData): Promise<PetPost> {
    await delay(500);
    
    const slug = generateSlug(data.title);
    const now = new Date().toISOString();
    
    // Map status from DB format to frontend format
    const statusMap: Record<string, 'lost' | 'found' | 'for-adoption' | 'rescue'> = {
      'LOST': 'lost',
      'FOUND': 'found',
      'FOR_ADOPTION': 'for-adoption',
      'RESCUE': 'rescue',
    };

    const newPost: PetPost = {
      id: String(nextPostId++),
      title: data.title,
      slug,
      description: data.description,
      image: data.images[0] || 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
      petType: data.petType,
      status: statusMap[data.status] || 'lost',
      location: data.district ? `${data.district}, ${data.city}` : data.city,
      locationCoords: data.latitude && data.longitude ? {
        latitude: data.latitude,
        longitude: data.longitude,
      } : undefined,
      postedBy: {
        id: 'user1', // Mock current user
        name: 'Người dùng hiện tại',
        phone: '0912345678',
        avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100',
      },
      createdAt: now,
      tags: data.tags || [],
      featured: false,
      views: 0,
      pet: data.petName ? {
        id: `pet-${nextPostId}`,
        name: data.petName,
        type: data.petType,
        breed: data.petBreed || data.petType,
        age: data.petAge || 0,
        gender: data.petGender === 'MALE' ? 'male' : 'female',
        color: data.petColor,
        size: data.petSize?.toLowerCase() as 'small' | 'medium' | 'large',
        personality: [],
        healthRecord: {
          id: `health-${nextPostId}`,
          vaccinations: [],
          medicalHistory: [],
          weight: [],
          lastCheckup: now,
          allergies: [],
        },
        photos: data.images,
      } : undefined,
    };
    
    localPosts = [newPost, ...localPosts];
    return newPost;
  },

  // Update post
  async updatePost(id: string, data: UpdatePostData): Promise<PetPost> {
    await delay(400);
    
    const index = localPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    
    // Check ownership (mock)
    if (localPosts[index].postedBy.id !== 'user1') {
      throw new Error('You can only edit your own posts');
    }
    
    const statusMap: Record<string, 'lost' | 'found' | 'for-adoption' | 'rescue'> = {
      'LOST': 'lost',
      'FOUND': 'found',
      'FOR_ADOPTION': 'for-adoption',
      'RESCUE': 'rescue',
    };
    
    localPosts[index] = {
      ...localPosts[index],
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.petType && { petType: data.petType }),
      ...(data.status && { status: statusMap[data.status] }),
      ...(data.city && {
        location: data.district ? `${data.district}, ${data.city}` : data.city,
      }),
      ...(data.images && data.images.length > 0 && { image: data.images[0] }),
    };
    
    return localPosts[index];
  },

  // Delete post
  async deletePost(id: string): Promise<void> {
    await delay(300);
    
    const index = localPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    
    // Check ownership (mock)
    if (localPosts[index].postedBy.id !== 'user1') {
      throw new Error('You can only delete your own posts');
    }
    
    localPosts = localPosts.filter(p => p.id !== id);
  },

  // Increase view count
  async increaseViews(id: string): Promise<void> {
    await delay(100);
    const post = localPosts.find(p => p.id === id);
    if (post) {
      post.views = (post.views || 0) + 1;
    }
  },

  // Cities list for Vietnam
  getCities(): string[] {
    return [
      'TP. Hồ Chí Minh',
      'Hà Nội',
      'Đà Nẵng',
      'Hải Phòng',
      'Cần Thơ',
      'Biên Hòa',
      'Nha Trang',
      'Huế',
      'Buôn Ma Thuột',
      'Thái Nguyên',
    ];
  },

  // Districts for a city (mock)
  getDistricts(city: string): string[] {
    const districts: Record<string, string[]> = {
      'TP. Hồ Chí Minh': [
        'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
        'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
        'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp',
        'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú',
        'Quận Thủ Đức', 'Huyện Bình Chánh', 'Huyện Củ Chi',
      ],
      'Hà Nội': [
        'Quận Hoàn Kiếm', 'Quận Ba Đình', 'Quận Đống Đa', 'Quận Hai Bà Trưng',
        'Quận Hoàng Mai', 'Quận Thanh Xuân', 'Quận Long Biên', 'Quận Cầu Giấy',
        'Quận Tây Hồ', 'Quận Bắc Từ Liêm', 'Quận Nam Từ Liêm',
      ],
    };
    return districts[city] || ['Khác'];
  },

  // Pet types
  getPetTypes(): string[] {
    return ['Chó', 'Mèo', 'Chim', 'Thỏ', 'Cá', 'Hamster', 'Khác'];
  },

  // Mock image upload
  async uploadImage(file: File): Promise<string> {
    await delay(800);
    // Return a mock image URL
    const mockImages = [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800',
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
    ];
    return mockImages[Math.floor(Math.random() * mockImages.length)];
  },
};

export default petPostService;
