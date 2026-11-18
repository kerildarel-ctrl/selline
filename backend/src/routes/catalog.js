import { Router } from 'express'
import { HttpError, VISIBLE, now, uid, createNotification, productById, productsWhere } from '../lib.js'
import { reviewSchema } from '../schemas.js'

const SORTS = {
  popular: 'p.review_count DESC, p.rating DESC, p.created_at DESC',
  price_asc: 'p.price ASC, p.created_at DESC',
  price_desc: 'p.price DESC, p.created_at DESC',
  newest: 'p.created_at DESC',
}
const escapeLike = (s) => s.replace(/[%_\\]/g, '\\$&')

export function publicCatalogRoutes({ db }) {
  const r = Router()

  r.get('/categories', async (_req, res) => {
    const rows = await db.prepare('SELECT id, name, slug FROM categories ORDER BY name').all()
    res.json(rows)
  })

  r.get('/products', async (req, res) => {
    const q = String(req.query.q ?? '').trim().slice(0, 100)
    const category = String(req.query.category ?? '').trim()
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12))

    const where = [VISIBLE]
    const args = []

    if (q) {
      const like = `%${escapeLike(q)}%`
      where.push('(p.name ILIKE ? OR p.brand ILIKE ? OR p.description ILIKE ?)')
      args.push(like, like, like)
    }
    if (category) { where.push('p.category_id = ?'); args.push(category) }

    const min = parseInt(req.query.min, 10), max = parseInt(req.query.max, 10)
    const rating = parseFloat(req.query.rating)
    if (Number.isFinite(min) && min > 0) { where.push('p.price >= ?'); args.push(min) }
    if (Number.isFinite(max) && max > 0) { where.push('p.price <= ?'); args.push(max) }
    if (req.query.freeShipping === '1') where.push('p.free_shipping = 1')
    if (req.query.verified === '1') where.push('s.verified = 1')
    if (Number.isFinite(rating) && rating > 0) { where.push('p.rating >= ?'); args.push(Math.min(rating, 5)) }

    const clause = where.join(' AND ')
    let counter = 0
    const clausePg = clause.replace(/\?/g, () => `$${++counter}`)

    const totalRow = await db.pool.query(
      `SELECT COUNT(*) AS n FROM products p JOIN shops s ON s.id = p.shop_id JOIN users ow ON ow.id = s.owner_id WHERE ${clausePg}`,
      args
    )
    const total = Number(totalRow.rows[0]?.n ?? 0)
    const items = await productsWhere(db, clause, args, SORTS[req.query.sort] ?? SORTS.newest, 'LIMIT ? OFFSET ?', limit, (page - 1) * limit)
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
  })

  r.get('/products/:id', async (req, res) => {
    const p = await productById(db, req.params.id, { publicOnly: true })
    if (!p) throw new HttpError(404, 'Produit introuvable.')
    res.json(p)
  })

  r.get('/products/:id/reviews', async (req, res) => {
    const rows = await db.prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.first_name, u.last_name
      FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 100`).all(req.params.id)
    const stats = await db.prepare('SELECT AVG(rating) AS avg, COUNT(*) AS n FROM reviews WHERE product_id = ?').get(req.params.id)
    const count = Number(stats?.n ?? 0)
    const average = count ? Math.round(Number(stats.avg) * 10) / 10 : 0
    res.json({
      items: rows.map((x) => ({ id: x.id, author: `${x.first_name} ${x.last_name.charAt(0)}.`, rating: x.rating, comment: x.comment, createdAt: x.created_at })),
      total: count, average,
    })
  })

  return r
}

export function socialRoutes({ db }) {
  const r = Router()

  r.post('/products/:id/reviews', async (req, res) => {
    const b = reviewSchema.parse(req.body)
    const product = await db.prepare('SELECT p.id, p.name, s.owner_id FROM products p JOIN shops s ON s.id = p.shop_id WHERE p.id = ?').get(req.params.id)
    if (!product) throw new HttpError(404, 'Produit introuvable.')
    if (product.owner_id === req.user.id) throw new HttpError(403, 'Vous ne pouvez pas noter vos propres produits.')
    const delivered = await db.prepare(`
      SELECT 1 FROM order_items i
      JOIN orders o ON o.id = i.order_id
      JOIN order_shops os ON os.order_id = o.id AND os.shop_id = i.shop_id
      WHERE o.user_id = ? AND i.product_id = ? AND os.status = 'delivered' LIMIT 1`).get(req.user.id, product.id)
    if (!delivered) throw new HttpError(403, 'Vous pourrez noter ce produit une fois votre commande livrée.')
    if (await db.prepare('SELECT 1 FROM reviews WHERE product_id = ? AND user_id = ?').get(product.id, req.user.id))
      throw new HttpError(409, 'Vous avez déjà donné votre avis sur ce produit.')
    const id = uid(), at = now()
    await db.transaction(async (client) => {
      const cp = (sql) => db.prepareOnClient(client, sql)
      await cp('INSERT INTO reviews (id, product_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, product.id, req.user.id, b.rating, b.comment, at)
      const stats = await cp('SELECT AVG(rating) AS avg, COUNT(*) AS n FROM reviews WHERE product_id = ?').get(product.id)
      const n = Number(stats?.n ?? 0)
      await cp('UPDATE products SET rating = ?, review_count = ? WHERE id = ?').run(n ? Math.round(Number(stats.avg) * 10) / 10 : 0, n, product.id)
      await createNotification(db, product.owner_id, { title: `Nouvel avis ${b.rating}/5`, body: product.name, link: `/product/${product.id}` })
    })
    res.status(201).json({ id, author: `${req.user.firstName} ${req.user.lastName.charAt(0)}.`, rating: b.rating, comment: b.comment, createdAt: at })
  })

  r.get('/favorites', async (req, res) => {
    const rows = await db.prepare('SELECT product_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
    const ids = rows.map((x) => x.product_id)
    if (ids.length === 0) return res.json([])
    const products = await productsWhere(db, `p.id IN (${ids.map(() => '?').join(',')}) AND ${VISIBLE}`, ids)
    res.json(ids.map((id) => products.find((p) => p.id === id)).filter(Boolean))
  })

  r.put('/favorites/:productId', async (req, res) => {
    if (!await db.prepare('SELECT 1 FROM products WHERE id = ?').get(req.params.productId)) throw new HttpError(404, 'Produit introuvable.')
    await db.prepare('INSERT INTO favorites (user_id, product_id, created_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING').run(req.user.id, req.params.productId, now())
    res.status(204).end()
  })

  r.delete('/favorites/:productId', async (req, res) => {
    await db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId)
    res.status(204).end()
  })

  return r
}
