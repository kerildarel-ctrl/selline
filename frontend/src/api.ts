import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

const ax = axios.create({ baseURL: BASE })

ax.interceptors.request.use(c => {
  const t = localStorage.getItem('token')
  if(t) c.headers!.Authorization = `Bearer ${t}`
  return c
})

ax.interceptors.response.use(r => r, e => {
  if(e.response?.status === 401) {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    if(!location.pathname.startsWith('/login') && !location.pathname.startsWith('/register'))
      location.href = '/login'
  }
  return Promise.reject(e)
})

const g = (url: string, params?: object) => ax.get(url, { params }).then(r => r.data)
const p = (url: string, data?: object) => ax.post(url, data).then(r => r.data)
const pu = (url: string, data?: object) => ax.put(url, data).then(r => r.data)
const pa = (url: string, data?: object) => ax.patch(url, data).then(r => r.data)
const d = (url: string) => ax.delete(url).then(r => r.data)

export const api = {
  // Auth
  login: (data: object) => p('/auth/login', data),
  register: (data: object) => p('/auth/register', data),
  verifyEmail: (token: string) => p('/auth/verify-email', { token }),
  resendVerificationPublic: (data: object) => p('/auth/resend-verification-public', data),
  forgotPassword: (data: object) => p('/auth/forgot-password', data),
  resetPassword: (data: object) => p('/auth/reset-password', data),

  // Account
  me: () => g('/account/me'),
  updateAccount: (data: object) => pu('/account/me', data),
  counters: () => g('/account/counters'),

  // Catalog
  categories: () => g('/catalog/categories'),
  products: (params?: object) => g('/catalog/products', params),
  product: (id: string) => g(`/catalog/products/${id}`),

  // Favorites
  favorites: () => g('/account/favorites'),
  addFavorite: (productId: string) => p('/account/favorites', { productId }),
  removeFavorite: (productId: string) => d(`/account/favorites/${productId}`),

  // Addresses
  addresses: () => g('/account/addresses'),
  createAddress: (data: object) => p('/account/addresses', data),
  deleteAddress: (id: string) => d(`/account/addresses/${id}`),

  // Orders
  createOrder: (data: object) => p('/orders', data),
  orders: () => g('/orders'),
  order: (id: string) => g(`/orders/${id}`),

  // Notifications
  notifications: () => g('/account/notifications'),
  markNotificationRead: (id: string) => pa(`/account/notifications/${id}/read`),

  // Messages
  conversations: () => g('/messages'),
  conversation: (id: string) => g(`/messages/${id}`),
  sendMessage: (convId: string, content: string) => p(`/messages/${convId}`, { content }),
  startConversation: (data: object) => p('/messages', data),

  // Seller
  sellerStats: () => g('/seller/stats'),
  sellerProducts: () => g('/seller/products'),
  sellerOrders: () => g('/seller/orders'),
  createProduct: (data: object) => p('/seller/products', data),
  updateProduct: (id: string, data: object) => pu(`/seller/products/${id}`, data),
  deleteProduct: (id: string) => d(`/seller/products/${id}`),
  uploadProductImages: (id: string, fd: FormData) => ax.post(`/seller/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  updateOrderStatus: (id: string, status: string) => pa(`/seller/orders/${id}/status`, { status }),
  registerSeller: (data: object) => p('/seller/register', data),

  // Admin
  adminStats: () => g('/admin/stats'),
  adminUsers: (q?: string) => g('/admin/users', q ? { q } : undefined),
  adminBlockUser: (id: string, blocked: boolean) => pa(`/admin/users/${id}`, { blocked }),
  adminShops: () => g('/admin/shops'),
  adminVerifyShop: (id: string, verified: boolean) => pa(`/admin/shops/${id}`, { verified }),
  adminSuspendShop: (id: string, suspended: boolean) => pa(`/admin/shops/${id}`, { suspended }),
  adminProducts: (q?: string) => g('/admin/products', q ? { q } : undefined),
  adminDeleteProduct: (id: string) => d(`/admin/products/${id}`),
  adminCreateCategory: (data: object) => p('/admin/categories', data),
  adminDeleteCategory: (id: string) => d(`/admin/categories/${id}`),
  adminReviews: () => g('/admin/reviews'),
  adminDeleteReview: (id: string) => d(`/admin/reviews/${id}`),
}
