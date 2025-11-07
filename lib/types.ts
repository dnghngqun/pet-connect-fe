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
}

export interface PetPost {
  id: string
  title: string
  slug: string
  description: string
  image: string
  petType: string
  status: "lost" | "found" | "for-adoption" | "rescue"
  location: string
  postedBy: {
    id: string
    name: string
    phone: string
    avatar?: string
  }
  createdAt: string
  tags: string[]
  featured?: boolean
  views?: number
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
