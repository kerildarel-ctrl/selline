export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  city?: string
  avatar?: string
  role: 'buyer' | 'seller'
  isAdmin: boolean
  emailVerified: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Shop {
  id: string
  ownerId: string
  name: string
  city?: string
  phone?: string
  description?: string
  verified: boolean
  suspended: boolean
  createdAt: string
}

export interface Product {
  id: string
  shopId: string
  shop: { id: string; name: string; city?: string; phone?: string; verified: boolean }
  category?: { id: string; name: string; slug: string }
  name: string
  brand?: string
  description?: string
  price: number
  stock: number
  inStock: boolean
  freeShipping: boolean
  shippingFee: number
  rating: number
  reviewCount: number
  images: string[]
  isFavorite?: boolean
  reviews?: Review[]
  createdAt: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  author: string
  rating: number
  comment?: string
  createdAt: string
}

export interface CartItem {
  product: Product
  qty: number
}

export interface Order {
  id: string
  reference: string
  userId: string
  status: string
  subtotal: number
  shippingFee: number
  total: number
  paymentMethod: string
  paymentPhone?: string
  address?: object
  items?: OrderItem[]
  createdAt: string
}

export interface OrderItem {
  id: number
  orderId: string
  productId: string
  shopId: string
  name: string
  image?: string
  price: number
  qty: number
  shippingFee: number
}

export interface Address {
  id: string
  userId: string
  fullName: string
  phone: string
  city: string
  quarter: string
  details?: string
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  productId?: string
  product?: { id: string; name: string }
  otherUser: { id: string; firstName: string; lastName: string }
  lastMessage?: string
  unread: number
  messages?: Message[]
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}
