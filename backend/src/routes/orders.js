import { Router } from 'express'
import { randomInt } from 'node:crypto'
import { HttpError, VISIBLE, createNotification, loadOrders, now, uid } from '../lib.js'
import { orderSchema } from '../schemas.js'

const MOMO = /^(\+?237)?6\d{8}$/

async function newReference(db) {
  for (let i = 0; i < 10; i++) {
    const ref = `SL-${new Date().toISOString().slice(2, 10).replaceAll('-', '')}-${randomInt(10000, 99999)}`
    if (!await db.prepare('SELECT 1 FROM orders WHERE reference = ?').get(ref)) return ref
  }
  throw new Error('Impossible de générer une référence de commande.')
}

export function orderRoutes({ db }) {
  const r = Router()

  r.post('/orders', async (req, res) => {
    const b = orderSchema.parse(req.body)
    if (b.paymentMethod === 'mobile') {
      const phone = (b.paymentPhone ?? '').replace(/[\s.-]/g, '')
      if (!MOMO.test(phone)) throw new HttpError(400, 'Numéro Mobile Money invalide (ex. 6 70 00 00 00).')
    }
    const address = await db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(b.addressId, req.user.id)
    if (!address) throw new HttpError(400, 'Adresse de livraison introuvable.')

    const wanted = new Map()
    for (const it of b.items) wanted.set(it.productId, (wanted.get(it.productId) ?? 0) + it.qty)

    const orderId = uid()
    const reference = await newReference(db)

    await db.transaction(async (client) => {
      const cp = (sql) => db.prepareOnClient(client, sql)
      const lines = []
      for (const [productId, qty] of wanted) {
        const p = await cp(`SELECT p.*, s.owner_id FROM products p JOIN shops s ON s.id = p.shop_id JOIN users ow ON ow.id = s.owner_id WHERE p.id = ? AND ${VISIBLE}`).get(productId)
        if (!p) throw new HttpError(400, "Un produit de votre panier n'est plus disponible.")
        if (p.owner_id === req.user.id) throw new HttpError(400, 'Vous ne pouvez pas acheter vos propres produits.')
        if (qty > 99) throw new HttpError(400, 'Quantité trop élevée.')
        const { rowCount } = await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1', [qty, p.id])
        if (rowCount === 0) {
          const cur = await cp('SELECT stock FROM products WHERE id = ?').get(p.id)
          throw new HttpError(409, cur?.stock > 0 ? `Stock insuffisant pour « ${p.name} ».` : `« ${p.name} » est en rupture de stock.`)
        }
        const imgRow = await cp('SELECT url FROM product_images WHERE product_id = ? ORDER BY position, id LIMIT 1').get(p.id)
        lines.push({ p, qty, image: imgRow?.url ?? null, fee: p.free_shipping ? 0 : p.shipping_fee })
      }
      const feeByShop = new Map()
      for (const l of lines) feeByShop.set(l.p.shop_id, Math.max(feeByShop.get(l.p.shop_id) ?? 0, l.fee))
      const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
      const shipping = [...feeByShop.values()].reduce((a, c) => a + c, 0)
      const addr = { id: address.id, fullName: address.full_name, phone: address.phone, city: address.city, quarter: address.quarter, details: address.details }
      await cp(`INSERT INTO orders (id, reference, user_id, status, subtotal, shipping_fee, total, payment_method, payment_phone, address_json, created_at)
                VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`)
        .run(orderId, reference, req.user.id, subtotal, shipping, subtotal + shipping, b.paymentMethod, b.paymentMethod === 'mobile' ? b.paymentPhone : null, JSON.stringify(addr), now())
      for (const l of lines) {
        await cp('INSERT INTO order_items (order_id, product_id, shop_id, name, image, price, qty, shipping_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run(orderId, l.p.id, l.p.shop_id, l.p.name, l.image, l.p.price, l.qty, feeByShop.get(l.p.shop_id))
      }
      for (const [shopId] of feeByShop) {
        await cp("INSERT INTO order_shops (order_id, shop_id, status) VALUES (?, ?, 'pending')").run(orderId, shopId)
        const ownerRow = await cp('SELECT owner_id FROM shops WHERE id = ?').get(shopId)
        await createNotification(db, ownerRow.owner_id, { title: 'Nouvelle commande', body: `Commande ${reference}`, link: '/seller/orders' })
      }
    })

    const orderRow = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId)
    res.status(201).json((await loadOrders(db, [orderRow]))[0])
  })

  r.get('/orders', async (req, res) => {
    const rows = await db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 200').all(req.user.id)
    res.json(await loadOrders(db, rows))
  })

  r.get('/orders/:id', async (req, res) => {
    const row = await db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
    if (!row) throw new HttpError(404, 'Commande introuvable.')
    res.json((await loadOrders(db, [row]))[0])
  })

  return r
}
