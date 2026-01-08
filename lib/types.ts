export interface PetHealthRecord {
  id: string
  vaccinations: {
    name: string
    date: string
    nextDue?: string
  }[]
  medicalHistory: {
    date: string
    condition: string
    treatment: string
    notes?: string
  }[]
  weight: {
    date: string
    value: number // kg
  }[]
  lastCheckup: string
  allergies: string[]
  notes?: string
}

export interface PetProfile {
  id: string
  name: string
  type: string // Husky, Golden Retriever, etc.
  breed?: string
  age: number // months
  gender: "male" | "female"
  color?: string
  size?: "small" | "medium" | "large"
  weight?: number // kg
  personality: string[] // friendly, playful, gentle, etc.
  specialNeeds?: string
  bio?: string
  healthRecord: PetHealthRecord
  photos: string[] // array of image URLs
  qrCodeUrl?: string // URL để fetch QR code từ backend (trả về binary data)
}

export interface PetPost {
  id: string
  title: string
  slug: string
  description: string
  image: string
  images?: string[] // List of all images
  petType: string
  status: "lost" | "found" | "for-adoption" | "rescue" | "general"
  postType?: string
  location: string
  city?: string
  district?: string
  // Optional: location object for geolocation features
  locationCoords?: {
    latitude: number
    longitude: number
  }
  postedBy: {
    id: string
    name: string
    phone: string
    avatar?: string
    isVerified?: boolean
  }
  createdAt: string
  tags?: string[]
  views: number
  featured?: boolean
  reactionCount?: number
  favoriteCount?: number
  commentCount: number
  userReaction?: string | null
  isFavorited?: boolean
  meta?: Record<string, any> // Post-type specific metadata
  pet?: PetProfile // thông tin chi tiết pet liên quan
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  pet: "cat" | "dog" | "both"
  rating: number
  reviewCount: number
  isNew?: boolean
  discount?: number
  featured?: boolean
  stock: number
  tags: string[]
}

export interface Review {
  id: string
  productId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export interface User {
  id: string
  name: string
  email: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface Location {
  latitude: number
  longitude: number
  address: string
  district?: string
  city?: string
}

export interface RescueCenter {
  id: string
  name: string
  location: Location
  phone: string
  email?: string
  website?: string
  hours?: string
  specialties?: string[] // "dog", "cat", "bird", etc.
  distance?: number // km from user
  rating?: number
  reviewCount?: number
}

export interface Notification {
  id: number
  type: string
  title: string
  content: string
  link?: string
  isRead: boolean
  createdAt: string
  fromUserId?: number
  fromUserName?: string
  fromUserAvatar?: string
  postId?: number
}

export interface Order {
  id: string
  userId: string
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
}

export interface FundraisingCampaign {
  id: string
  title: string
  slug: string
  description: string
  image: string
  category: "medical" | "rescue" | "shelter" | "food" | "other"
  targetAmount: number
  currentAmount: number
  currency: string // VND, USD, etc.
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
  relatedPet?: {
    id: string
    name: string
    image?: string
  }
  status: "active" | "paused" | "completed" | "cancelled"
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
  description_detailed?: string
  beneficiary?: string // Tổ chức nhận tiền
  updates?: FundraisingUpdate[]
}

export interface FundraisingUpdate {
  id: string
  campaignId: string
  title: string
  content: string
  createdAt: string
  images?: string[]
}

export interface Donation {
  id: string
  campaignId: string
  donorId?: string // null nếu ẩn danh
  amount: number
  currency: string
  message?: string
  isAnonymous: boolean
  paymentMethod: "momo" | "zalopay" | "bank" | "card"
  status: "pending" | "completed" | "failed"
  createdAt: string
}

export interface DonationWall {
  id: string
  campaignId: string
  donations: Donation[]
  totalDonors: number
  totalRaised: number
}
