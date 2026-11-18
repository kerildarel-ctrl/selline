import { z } from 'zod'

const phone = z.string().regex(/^(\+?237)?[0-9]{8,9}$/, 'Numéro de téléphone invalide').optional().nullable()
const price = z.number().int().min(0, 'Le prix doit être positif')
const positiveInt = z.number().int().min(0)

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court').max(50),
  lastName: z.string().min(2, 'Nom trop court').max(50),
  email: z.string().email('Adresse e-mail invalide'),
  phone: phone,
  password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const forgotSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
})

export const profileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: phone,
  city: z.string().max(100).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
}).partial()

export const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit comporter au moins 8 caractères'),
})

export const addressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^(\+?237)?[0-9]{8,9}$/, 'Numéro de téléphone invalide'),
  city: z.string().min(2).max(100),
  quarter: z.string().min(2).max(100),
  details: z.string().max(300).optional().nullable(),
})

export const shopSchema = z.object({
  name: z.string().min(2, 'Nom de boutique trop court').max(100),
  city: z.string().min(2).max(100).optional().nullable(),
  phone: phone,
  description: z.string().max(1000).optional().nullable(),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Nom du produit trop court').max(200),
  brand: z.string().max(100).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  price: price,
  stock: positiveInt,
  freeShipping: z.boolean(),
  shippingFee: positiveInt,
  images: z.array(z.string().url()).max(8, 'Maximum 8 images'),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Commentaire trop court (10 caractères minimum)').max(2000),
})

export const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(99) })).min(1),
  addressId: z.string(),
  paymentMethod: z.enum(['mobile', 'card', 'cod']),
  paymentPhone: z.string().optional().nullable(),
})

export const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
})

export const conversationSchema = z.object({
  shopId: z.string(),
  productId: z.string().optional().nullable(),
})

export const messageSchema = z.object({
  text: z.string().min(1).max(2000),
})

export const adminShopSchema = z.object({
  verified: z.boolean().optional(),
  suspended: z.boolean().optional(),
})

export const adminUserSchema = z.object({
  blocked: z.boolean(),
})

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
})
