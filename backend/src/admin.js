import bcrypt from 'bcryptjs'
import { now, uid } from './lib.js'

export async function ensureAdmin(db, email, password) {
  email = String(email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Adresse e-mail invalide.')
  const existing = await db.prepare('SELECT id, is_admin FROM users WHERE email = ?').get(email)
  if (existing) {
    if (existing.is_admin) return 'déjà administrateur'
    await db.prepare('UPDATE users SET is_admin = 1, blocked = 0 WHERE id = ?').run(existing.id)
    return 'promu administrateur'
  }
  if (!password || password.length < 8) throw new Error("Ce compte n'existe pas : fournissez un mot de passe de 8 caractères minimum.")
  const hash = await bcrypt.hash(password, 10)
  await db.prepare('INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_admin, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)')
    .run(uid(), 'Admin', 'Selline', email, hash, 'buyer', now())
  return 'créé'
}
