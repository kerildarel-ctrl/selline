import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import { now, uid } from './lib.js'

export async function seedDemo(db, config) {
  const countRow = await db.prepare('SELECT COUNT(*) AS n FROM users').get()
  if (Number(countRow?.n ?? 0) > 0) return false
  fs.mkdirSync(config.uploadDir, { recursive: true })
  const hash = await bcrypt.hash('demo1234', 10)

  await db.transaction(async (client) => {
    const cp = (sql) => db.prepareOnClient(client, sql)
    // Acheteur démo
    const demoId = uid()
    await cp('INSERT INTO users (id, first_name, last_name, email, phone, city, password_hash, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)')
      .run(demoId, 'Kero', 'Demo', 'demo@selline.cm', '670000001', 'Yaoundé', hash, 'buyer', now())
    // Admin
    const adminId = uid()
    await cp('INSERT INTO users (id, first_name, last_name, email, phone, city, password_hash, role, is_admin, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)')
      .run(adminId, 'Admin', 'Selline', 'admin@selline.cm', null, 'Yaoundé', hash, 'buyer', now())
    // Vendeur 1
    const v1Id = uid()
    await cp('INSERT INTO users (id, first_name, last_name, email, phone, city, password_hash, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)')
      .run(v1Id, 'Vendeur', 'Demo', 'vendeur@selline.cm', '670000002', 'Yaoundé', hash, 'seller', now())
    await cp('INSERT INTO shops (id, owner_id, name, city, phone, description, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(uid(), v1Id, 'Boutique Demo', 'Yaoundé', '670000002', 'Boutique de démonstration', 1, now())
    // Vendeur 2
    const v2Id = uid()
    await cp('INSERT INTO users (id, first_name, last_name, email, phone, city, password_hash, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)')
      .run(v2Id, 'Tech', 'Mboa', 'tech@selline.cm', '699000000', 'Douala', hash, 'seller', now())
    await cp('INSERT INTO shops (id, owner_id, name, city, phone, description, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(uid(), v2Id, 'Tech Mboa', 'Douala', '699000000', null, 0, now())
    // Adresse + notification
    await cp('INSERT INTO addresses (id, user_id, full_name, phone, city, quarter, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(uid(), demoId, 'Kero Demo', '670000001', 'Yaoundé', 'Bastos', 'Près du rond-point', now())
    await cp('INSERT INTO notifications (id, user_id, title, body, link, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)')
      .run(uid(), demoId, 'Bienvenue sur Selline 👋', 'Ceci est un compte de démonstration.', '/home', now())
  })
  return true
}
