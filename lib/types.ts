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
