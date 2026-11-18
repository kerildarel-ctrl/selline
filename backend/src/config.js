import 'dotenv/config'
import path from 'node:path'

const isProd = process.env.NODE_ENV === 'production'

let jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  if (isProd) throw new Error('JWT_SECRET est obligatoire en production.')
  jwtSecret = 'dev-only-secret-ne-pas-utiliser-en-production'
  console.warn('⚠️  JWT_SECRET absent.')
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL est obligatoire.')

const isVercel = !!process.env.VERCEL
const defaultUploadDir = isVercel ? '/tmp/uploads' : 'uploads'

export const config = {
  isProd,
  port: Number(process.env.PORT) || 3000,
  jwtSecret,
  jwtTtl: '30d',
  databaseUrl,
  uploadDir: path.resolve(process.env.UPLOAD_DIR || defaultUploadDir),
  publicUrl: (process.env.PUBLIC_URL || '').replace(/\/$/, ''),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : 1,
  seedDemo: process.env.SEED_DEMO !== 'false' && !isProd,
  brevoApiKey: process.env.BREVO_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'no-reply@selline.cm',
  fromName: process.env.FROM_NAME || 'Selline',
  appUrl: (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, ''),
}
