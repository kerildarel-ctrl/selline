import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { requireAuth, requireAdmin, errorHandler, notFound } from './middleware.js'
import { authRoutes } from './routes/auth.js'
import { accountRoutes } from './routes/account.js'
import { publicCatalogRoutes, socialRoutes } from './routes/catalog.js'
import { orderRoutes } from './routes/orders.js'
import { shopRoutes, sellerRoutes } from './routes/seller.js'
import { messageRoutes, notificationRoutes } from './routes/messages.js'
import { adminRoutes } from './routes/admin.js'
import { uploadRoutes } from './routes/uploads.js'
import path from 'node:path'
import { createRequire } from 'node:module'

export function createApp(ctx) {
  const { config } = ctx
  const app = express()

  if (config.trustProxy) app.set('trust proxy', config.trustProxy)

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(cors({ origin: config.corsOrigins, credentials: true }))
  app.use(express.json({ limit: '2mb' }))

  // Santé
  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  // Images envoyées
  app.use('/api/uploads', express.static(config.uploadDir, {
    index: false, maxAge: '30d', immutable: true,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
    },
  }))

  // Rate limiting
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
  app.use('/api', limiter)
  app.use('/api/register', authLimiter)
  app.use('/api/login', authLimiter)
  app.use('/api/forgot-password', authLimiter)

  // Routes publiques
  app.use('/api', authRoutes(ctx))
  app.use('/api', publicCatalogRoutes(ctx))
  app.use('/api', uploadRoutes(ctx))

  // Routes authentifiées
  app.use('/api', requireAuth(ctx), accountRoutes(ctx))
  app.use('/api', requireAuth(ctx), socialRoutes(ctx))
  app.use('/api', requireAuth(ctx), orderRoutes(ctx))
  app.use('/api', requireAuth(ctx), shopRoutes(ctx))
  app.use('/api', requireAuth(ctx), sellerRoutes(ctx))
  app.use('/api', requireAuth(ctx), messageRoutes(ctx))
  app.use('/api', requireAuth(ctx), notificationRoutes(ctx))

  // Routes admin
  app.use('/api/admin', requireAuth(ctx), requireAdmin, adminRoutes(ctx))

  app.use(notFound)
  app.use(errorHandler)

  return app
}
