import { randomUUID } from 'node:crypto'

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

export const uid = () => randomUUID()
export const now = () => new Date().toISOString()

const WAT_MS = 3600e3
export function startOfDayWAT(date = new Date()) {
  const local = new Date(date.getTime() + WAT_MS)
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - WAT_MS).toISOString()
}
export function startOfMonthWAT(date = new Date()) {
  const local = new Date(date.getTime() + WAT_MS)
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - WAT_MS).toISOString()
}

export function isOwnUploadUrl(config, url) {
  const re = /^\/api\/uploads\/[\w.-]+$/
  if (re.test(url)) return true
  return !!config.publicUrl && url.startsWith(`${config.publicUrl}/`) && re.test(url.slice(config.publicUrl.length))
}
export function assertOwnImages(config, urls) {
  for (const u of urls) if (!isOwnUploadUrl(config, u)) throw new HttpError(400, "Adresse d'image invalide : utilisez le bouton d'envoi de photo.")
}

export const statusLabels = {
  pending: 'En attente', confirmed: 'Confirmée', shipped: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée',
}

export function toShop(s) {
  return s && { id: s.id, name: s.name, city: s.city, phone: s.phone, description: s.description, verified: !!s.verified, suspended: !!s.suspended }
}
export function toUser(u, shop) {
  return {
    id: u.id, firstName: u.first_name, lastName: u.last_name, email: u.email,
    phone: u.phone, city: u.city, avatar: u.avatar, role: u.role, isAdmin: !!u.is_admin,
    emailVerified: !!u.email_verified, shop: toShop(shop) ?? null,
  }
}
export async function loadUser(db, id) {
  const u = await db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  if (!u) return null
  return toUser(u, await db.prepare('SELECT * FROM shops WHERE owner_id = ?').get(id))
}

const PRODUCT_SELECT = `
  SELECT p.*, s.name AS shop_name, s.verified AS shop_verified,
         c.name AS cat_name, c.slug AS cat_slug
  FROM products p
  JOIN shops s ON s.id = p.shop_id
  JOIN users ow ON ow.id = s.owner_id
  LEFT JOIN categories c ON c.id = p.category_id`

export const VISIBLE = 's.suspended = 0 AND ow.blocked = 0'

export async function hydrateProducts(db, rows) {
  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')
  const imgs = await db.pool.query(
    `SELECT product_id, url FROM product_images WHERE product_id IN (${placeholders}) ORDER BY position, id`,
    ids
  ).then((r) => r.rows)
  const byProduct = new Map()
  for (const i of imgs) (byProduct.get(i.product_id) ?? byProduct.set(i.product_id, []).get(i.product_id)).push(i.url)
  return rows.map((p) => ({
    id: p.id, name: p.name, brand: p.brand, price: p.price, rating: p.rating, reviewCount: p.review_count,
    images: byProduct.get(p.id) ?? [],
    shop: { id: p.shop_id, name: p.shop_name, verified: !!p.shop_verified },
    freeShipping: !!p.free_shipping, shippingFee: p.shipping_fee,
    inStock: p.stock > 0, stock: p.stock,
    category: p.category_id ? { id: p.category_id, name: p.cat_name, slug: p.cat_slug } : null,
    description: p.description, createdAt: p.created_at,
  }))
}

export async function productById(db, id, { publicOnly = false } = {}) {
  const row = await db.prepare(`${PRODUCT_SELECT} WHERE p.id = ? ${publicOnly ? `AND ${VISIBLE}` : ''}`).get(id)
  return row ? (await hydrateProducts(db, [row]))[0] : null
}

export async function productsWhere(db, where, args, orderBy = 'p.created_at DESC', limitSql = '', ...limitArgs) {
  let counter = 0
  const reIndex = (s) => s.replace(/\?/g, () => `$${++counter}`)
  const whereIndexed = reIndex(where)
  const limitIndexed = limitSql ? reIndex(limitSql) : ''
  const sql = `${PRODUCT_SELECT} WHERE ${whereIndexed} ORDER BY ${orderBy}${limitIndexed ? ' ' + limitIndexed : ''}`
  const rows = await db.pool.query(sql, [...args, ...limitArgs]).then((r) => r.rows)
  return hydrateProducts(db, rows)
}

export async function loadOrders(db, rows, { shopId = null } = {}) {
  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')
  let items
  if (shopId) {
    items = await db.pool.query(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders}) AND shop_id = $${ids.length + 1} ORDER BY id`,
      [...ids, shopId]
    ).then((r) => r.rows)
  } else {
    items = await db.pool.query(`SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id`, ids).then((r) => r.rows)
  }
  const byOrder = new Map()
  for (const it of items) (byOrder.get(it.order_id) ?? byOrder.set(it.order_id, []).get(it.order_id)).push(it)
  let shopStatus = new Map()
  if (shopId) {
    const st = await db.pool.query(
      `SELECT order_id, status FROM order_shops WHERE shop_id = $1 AND order_id IN (${placeholders})`,
      [shopId, ...ids]
    ).then((r) => r.rows)
    shopStatus = new Map(st.map((s) => [s.order_id, s.status]))
  }
  return rows.map((o) => {
    const mine = byOrder.get(o.id) ?? []
    const base = {
      id: o.id, reference: o.reference, createdAt: o.created_at, paymentMethod: o.payment_method,
      items: mine.map((i) => ({ productId: i.product_id, name: i.name, image: i.image, price: i.price, qty: i.qty })),
      address: o.address_json ? JSON.parse(o.address_json) : null,
    }
    if (!shopId) return { ...base, status: o.status, subtotal: o.subtotal, shippingFee: o.shipping_fee, total: o.total }
    const subtotal = mine.reduce((s, i) => s + i.price * i.qty, 0)
    const shippingFee = mine.reduce((m, i) => Math.max(m, i.shipping_fee), 0)
    return { ...base, status: shopStatus.get(o.id) ?? o.status, subtotal, shippingFee, total: subtotal + shippingFee }
  })
}

export async function createNotification(db, userId, { title, body = null, link = null }) {
  await db.prepare('INSERT INTO notifications (id, user_id, title, body, link, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)')
    .run(uid(), userId, title, body, link, now())
}

export const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function deriveStatus(statuses) {
  const active = statuses.filter((s) => s !== 'cancelled')
  if (active.length === 0) return 'cancelled'
  if (active.every((s) => s === 'delivered')) return 'delivered'
  if (active.some((s) => s === 'shipped' || s === 'delivered')) return 'shipped'
  if (active.some((s) => s === 'confirmed')) return 'confirmed'
  return 'pending'
}

export async function refreshOrderStatus(db, orderId) {
  const rows = await db.prepare('SELECT status FROM order_shops WHERE order_id = ?').all(orderId)
  const status = deriveStatus(rows.map((x) => x.status))
  await db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId)
  return status
}

export async function logAdminAction(db, adminId, action, summary) {
  await db.prepare('INSERT INTO admin_actions (id, admin_id, action, summary, created_at) VALUES (?, ?, ?, ?, ?)').run(uid(), adminId, action, summary, now())
}
