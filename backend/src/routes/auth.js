import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { HttpError, loadUser, now, uid } from '../lib.js'
import { forgotSchema, loginSchema, registerSchema, resetPasswordSchema } from '../schemas.js'
import { requireAuth, signToken } from '../middleware.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../email.js'

const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', 10)
const VERIFY_TTL_MS = 30 * 60 * 1000
const RESET_TTL_MS = 60 * 60 * 1000

async function issueVerifyToken(db, userId) {
  const token = uid()
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS).toISOString()
  await db.prepare('UPDATE users SET verify_token = ?, verify_token_expires_at = ? WHERE id = ?').run(token, expiresAt, userId)
  return token
}

export function authRoutes(ctx) {
  const { db, config } = ctx
  const r = Router()

  r.post('/register', async (req, res) => {
    const b = registerSchema.parse(req.body)
    if (await db.prepare('SELECT 1 FROM users WHERE LOWER(email) = LOWER(?)').get(b.email))
      throw new HttpError(409, 'Un compte existe déjà avec cet e-mail.')
    const id = uid()
    const hash = await bcrypt.hash(b.password, 10)
    try {
      await db.prepare('INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)')
        .run(id, b.firstName, b.lastName, b.email, b.phone ?? null, hash, 'buyer', now())
    } catch (e) {
      if (String(e.code) === '23505' || String(e.message).includes('unique'))
        throw new HttpError(409, 'Un compte existe déjà avec cet e-mail.')
      throw e
    }
    const token = await issueVerifyToken(db, id)
    const userInfo = await db.prepare('SELECT first_name, last_name, email FROM users WHERE id = ?').get(id)
    sendVerificationEmail(config, { firstName: userInfo.first_name, lastName: userInfo.last_name, email: userInfo.email }, token).catch(console.error)
    res.status(201).json({ message: 'Compte créé. Vérifiez votre boîte mail pour activer votre compte.' })
  })

  r.get('/verify-email', async (req, res) => {
    const token = String(req.query.token || '')
    if (!token) return res.redirect(`${config.appUrl}/verify-email?status=invalid`)
    const row = await db.prepare('SELECT id, verify_token_expires_at FROM users WHERE verify_token = ? AND email_verified = 0').get(token)
    if (!row) return res.redirect(`${config.appUrl}/verify-email?status=invalid`)
    if (row.verify_token_expires_at && new Date(row.verify_token_expires_at) < new Date())
      return res.redirect(`${config.appUrl}/verify-email?status=expired`)
    await db.prepare('UPDATE users SET email_verified = 1, verify_token = NULL, verify_token_expires_at = NULL WHERE id = ?').run(row.id)
    return res.redirect(`${config.appUrl}/verify-email?status=success`)
  })

  r.post('/login', async (req, res) => {
    const b = loginSchema.parse(req.body)
    const row = await db.prepare('SELECT id, password_hash, blocked, email_verified FROM users WHERE LOWER(email) = LOWER(?)').get(b.email)
    const ok = await bcrypt.compare(b.password, row?.password_hash ?? DUMMY_HASH)
    if (!row || !ok) throw new HttpError(401, 'E-mail ou mot de passe incorrect.')
    if (row.blocked) throw new HttpError(403, 'Ce compte a été suspendu.')
    if (!row.email_verified) throw new HttpError(403, 'Veuillez vérifier votre adresse email avant de vous connecter.')
    res.json({ token: signToken(config, row.id), user: await loadUser(db, row.id) })
  })

  r.post('/resend-verification-public', async (req, res) => {
    const { email, password } = req.body ?? {}
    if (!email || !password) throw new HttpError(400, 'Email et mot de passe requis.')
    const row = await db.prepare('SELECT id, password_hash, email_verified, first_name, last_name, email FROM users WHERE LOWER(email) = LOWER(?)').get(email)
    const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH)
    if (!row || !ok) throw new HttpError(401, 'E-mail ou mot de passe incorrect.')
    if (row.email_verified) throw new HttpError(400, 'Ce compte est déjà vérifié.')
    const token = await issueVerifyToken(db, row.id)
    sendVerificationEmail(config, { firstName: row.first_name, lastName: row.last_name, email: row.email }, token).catch(console.error)
    res.status(204).end()
  })

  r.post('/forgot-password', async (req, res) => {
    const { email } = forgotSchema.parse(req.body)
    res.status(204).end()
    const row = await db.prepare('SELECT id, first_name, last_name, email FROM users WHERE LOWER(email) = LOWER(?)').get(email)
    if (!row) return
    await db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0').run(row.id)
    const token = uid()
    const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString()
    await db.prepare('INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, row.id, expiresAt)
    sendPasswordResetEmail(config, { firstName: row.first_name, lastName: row.last_name, email: row.email }, token).catch(console.error)
  })

  r.post('/reset-password', async (req, res) => {
    const { token, password } = resetPasswordSchema.parse(req.body)
    const row = await db.prepare('SELECT user_id, expires_at FROM password_resets WHERE token = ? AND used = 0').get(token)
    if (!row) throw new HttpError(400, 'Ce lien est invalide ou a déjà été utilisé.')
    if (new Date(row.expires_at) < new Date()) throw new HttpError(400, 'Ce lien a expiré. Faites une nouvelle demande.')
    const hash = await bcrypt.hash(password, 10)
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id)
    await db.prepare('UPDATE password_resets SET used = 1 WHERE token = ?').run(token)
    res.status(204).end()
  })

  r.post('/resend-verification', requireAuth(ctx), async (req, res) => {
    const userId = req.user.id
    const row = await db.prepare('SELECT email_verified, first_name, last_name, email FROM users WHERE id = ?').get(userId)
    if (row.email_verified) throw new HttpError(400, 'Votre adresse email est déjà vérifiée.')
    const token = await issueVerifyToken(db, userId)
    sendVerificationEmail(config, { firstName: row.first_name, lastName: row.last_name, email: row.email }, token).catch(console.error)
    res.status(204).end()
  })

  r.get('/me', requireAuth(ctx), (req, res) => res.json(req.user))
  return r
}
