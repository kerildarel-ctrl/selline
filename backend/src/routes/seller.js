import { Router } from 'express'
import {
  HttpError, TRANSITIONS, assertOwnImages, createNotification, loadOrders, now, productById,
  refreshOrderStatus, startOfDayWAT, startOfMonthWAT, statusLabels, toShop, uid,
} from '../lib.js'
import { productSchema, shopSchema, statusSchema } from '../schemas.js'
import { requireSeller } from '../middleware.js'

export function shopRoutes({ db }) {
  const r = Router()
  r.post('/seller/shop', async (req, res) => {
    if (req.user.shop) throw new HttpError(409, 'Vous avez déjà une boutique.')
    const b = shopSchema.parse(req.body)
    const id = uid()
    await db.transaction(async (client) => {
      const cp = (sql) => db.prepareOnClient(client, sql)
      await cp('INSERT INTO shops (id, owner_id, name, city, phone, description, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)')
        .run(id, req.user.id, b.name, b.city, b.phone, b.description ?? null, now())
      await cp("UPDATE users SET role = 'seller' WHERE id = ?").run(req.user.id)
    })
    res.status(201).json(toShop(await db.prepare('SELECT * FROM shops WHERE id = ?').get(id)))
  })
  return r
}

export function sellerRoutes({ db, config }) {
  const r = Router()
  r.use('/seller', requireSeller)
  r.use('/seller', (req, _res, next) => {
    if (req.method !== 'GET' && req.user.shop.suspended)
      throw new HttpError(403, 'Votre boutique est suspendue : modifications impossibles.')
    next()
  })

  async function checkCategory(categoryId) {
    if (categoryId && !await db.prepare('SELECT 1 FROM categories WHERE id = ?').get(categoryId))
      throw new HttpError(400, 'Catégorie invalide.')
  }

  async function saveImages(productId, urls, client = null) {
    const cp = client ? (sql) => db.prepareOnClient(client, sql) : (sql) => db.prepare(sql)
    await cp('DELETE FROM product_images WHERE product_id = ?').run(productId)
    for (let i = 0; i < urls.length; i++) {
      await cp('INSERT INTO product_images (product_id, url, position) VALUES (?, ?, ?)').run(productId, urls[i], i)
    }
  }

  const ownProduct = async (req) => {
    const p = await db.prepare('SELECT id FROM products WHERE id = ? AND shop_id = ?').get(req.params.id, req.user.shop.id)
    if (!p) throw new HttpError(404, 'Produit introuvable.')
    return p
  }

  r.get('/seller/stats', async (req, res) => {
    const shopId = req.user.shop.id
    const q = async (sql, ...args) => Number((await db.prepare(sql).get(shopId, ...args))?.n ?? 0)
    const [ordersToday, revenueMonth, activeProducts, pendingOrders] = await Promise.all([
      q('SELECT COUNT(*) AS n FROM order_shops os JOIN orders o ON o.id = os.order_id WHERE os.shop_id = ? AND o.created_at >= ?', startOfDayWAT()),
      q(`SELECT COALESCE(SUM(i.price * i.qty), 0) AS n FROM order_items i
         JOIN order_shops os ON os.order_id = i.order_id AND os.shop_id = i.shop_id
         JOIN orders o ON o.id = i.order_id
         WHERE i.shop_id = ? AND os.status != 'cancelled' AND o.created_at >= ?`, startOfMonthWAT()),
      q('SELECT COUNT(*) AS n FROM products WHERE shop_id = ?'),
      q("SELECT COUNT(*) AS n FROM order_shops WHERE shop_id = ? AND status = 'pending'"),
    ])
    res.json({ ordersToday, revenueMonth, activeProducts, pendingOrders })
  })

  r.get('/seller/products', async (req, res) => {
    const ids = await db.prepare('SELECT id FROM products WHERE shop_id = ? ORDER BY created_at DESC').all(req.user.shop.id)
    const products = await Promise.all(ids.map((x) => productById(db, x.id)))
    res.json(products)
  })

  r.get('/seller/products/:id', async (req, res) => {
    const p = await ownProduct(req)
    res.json(await productById(db, p.id))
  })

  r.post('/seller/products', async (req, res) => {
    const b = productSchema.parse(req.body)
    await checkCategory(b.categoryId)
    assertOwnImages(config, b.images)
    const id = uid()
    await db.transaction(async (client) => {
      const cp = (sql) => db.prepareOnClient(client, sql)
      await cp(`INSERT INTO products (id, shop_id, category_id, name, brand, description, price, stock, free_shipping, shipping_fee, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, req.user.shop.id, b.categoryId ?? null, b.name, b.brand ?? null, b.description ?? null, b.price, b.stock, b.freeShipping ? 1 : 0, b.freeShipping ? 0 : b.shippingFee, now())
      await saveImages(id, b.images, client)
    })
    res.status(201).json(await productById(db, id))
  })

  r.put('/seller/products/:id', async (req, res) => {
    const { id } = await ownProduct(req)
    const b = productSchema.parse(req.body)
    await checkCategory(b.categoryId)
    assertOwnImages(config, b.images)
    await db.transaction(async (client) => {
      const cp = (sql) => db.prepareOnClient(client, sql)
      await cp(`UPDATE products SET category_id = ?, name = ?, brand = ?, description = ?, price = ?, stock = ?, free_shipping = ?, shipping_fee = ? WHERE id = ?`)
        .run(b.categoryId ?? null, b.name, b.brand ?? null, b.description ?? null, b.price, b.stock, b.freeShipping ? 1 : 0, b.freeShipping ? 0 : b.shippingFee, id)
      await saveImages(id, b.images, client)
    })
    res.json(await productById(db, id))
  })

  r.delete('/seller/products/:id', async (req, res) => {
    await db.prepare('DELETE FROM products WHERE id = ? AND shop_id = ?').run(req.params.id, req.user.shop.id)
    res.status(204).end()
  })

  const sellerOrderRows = async (shopId, orderId = null) => db.prepare(`
    SELECT o.*, u.first_name || ' ' || u.last_name AS customer_name
    FROM orders o JOIN users u ON u.id = o.user_id
    WHERE EXISTS (SELECT 1 FROM order_shops os WHERE os.order_id = o.id AND os.shop_id = ?) ${orderId ? 'AND o.id = ?' : ''}
    ORDER BY o.created_at DESC LIMIT 200`).all(shopId, ...(orderId ? [orderId] : []))

  r.get('/seller/orders', async (req, res) => {
    const rows = await sellerOrderRows(req.user.shop.id)
    res.json(await loadOrders(db, rows, { shopId: req.user.shop.id }))
  })

  r.patch('/seller/orders/:id', async (req, res) => {
    const { status } = statusSchema.parse(req.body)
    const shopId = req.user.shop.id
    const os = await db.prepare('SELECT * FROM order_shops WHERE order_id = ? AND shop_id = ?').get(req.params.id, shopId)
    if (!os) throw new HttpError(404, 'Commande introuvable.')
    if (!TRANSITIONS[os.status].includes(status))
      throw new HttpError(400, `Changement impossible : « ${statusLabels[os.status]} » → « ${statusLabels[status]} ».`)
    const order = await db.transaction(async (client) => {
      const cp = (sql) => db.prepareOnClient(client, sql)
      await cp('UPDATE order_shops SET status = ? WHERE order_id = ? AND shop_id = ?').run(status, req.params.id, shopId)
      if (status === 'cancelled') {
        const items = await cp('SELECT product_id, qty FROM order_items WHERE order_id = ? AND shop_id = ?').all(req.params.id, shopId)
        for (const i of items) await cp('UPDATE products SET stock = stock + ? WHERE id = ?').run(i.qty, i.product_id)
      }
      await refreshOrderStatus(db, req.params.id)
      return await cp('SELECT * FROM orders WHERE id = ?').get(req.params.id)
    })
    await createNotification(db, order.user_id, {
      title: `Commande ${order.reference} : ${statusLabels[status].toLowerCase()}`,
      body: `${req.user.shop.name} a mis à jour votre commande.`,
      link: `/orders/${order.id}`,
    })
    const rows = await sellerOrderRows(shopId, order.id)
    res.json((await loadOrders(db, rows, { shopId }))[0])
  })

  return r
}
