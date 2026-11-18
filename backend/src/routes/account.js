import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { HttpError, assertOwnImages, loadUser, now, uid } from '../lib.js'
import { addressSchema, passwordSchema, profileSchema } from '../schemas.js'

const toAddress = (a) => ({ id: a.id, fullName: a.full_name, phone: a.phone, city: a.city, quarter: a.quarter, details: a.details })

export function accountRoutes({ db, config }) {
  const r = Router()

  r.patch('/users/me', async (req, res) => {
    const b = profileSchema.parse(req.body)
    if (b.avatar) assertOwnImages(config, [b.avatar])
    const sets = ['first_name = ?', 'last_name = ?']
    const args = [b.firstName, b.lastName]
    for (const [key, col] of [['phone', 'phone'], ['city', 'city'], ['avatar', 'avatar']]) {
      if (b[key] !== undefined) { sets.push(`${col} = ?`); args.push(b[key] ?? null) }
    }
    await db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...args, req.user.id)
    res.json(await loadUser(db, req.user.id))
  })

  r.put('/users/me/password', async (req, res) => {
    const b = passwordSchema.parse(req.body)
    const row = await db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id)
    if (!(await bcrypt.compare(b.currentPassword, row.password_hash))) throw new HttpError(400, 'Mot de passe actuel incorrect.')
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await bcrypt.hash(b.newPassword, 10), req.user.id)
    res.status(204).end()
  })

  r.get('/addresses', async (req, res) => {
    const rows = await db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
    res.json(rows.map(toAddress))
  })

  r.post('/addresses', async (req, res) => {
    const b = addressSchema.parse(req.body)
    const count = await db.prepare('SELECT COUNT(*) AS n FROM addresses WHERE user_id = ?').get(req.user.id)
    if (Number(count.n) >= 20) throw new HttpError(400, 'Vous avez atteint la limite de 20 adresses.')
    const id = uid()
    await db.prepare('INSERT INTO addresses (id, user_id, full_name, phone, city, quarter, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, req.user.id, b.fullName, b.phone, b.city, b.quarter, b.details ?? null, now())
    res.status(201).json(toAddress(await db.prepare('SELECT * FROM addresses WHERE id = ?').get(id)))
  })

  r.delete('/addresses/:id', async (req, res) => {
    await db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
    res.status(204).end()
  })

  return r
}
