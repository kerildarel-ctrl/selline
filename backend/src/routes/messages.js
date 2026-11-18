import { Router } from 'express'
import { HttpError, createNotification, now, uid } from '../lib.js'
import { conversationSchema, messageSchema } from '../schemas.js'

const CONV_SELECT = `
  SELECT c.*, s.name AS shop_name, s.owner_id AS owner_id,
         u.first_name || ' ' || u.last_name AS buyer_name,
         p.name AS product_name
  FROM conversations c
  JOIN shops s ON s.id = c.shop_id
  JOIN users u ON u.id = c.buyer_id
  LEFT JOIN products p ON p.id = c.product_id`

export function messageRoutes({ db }) {
  const r = Router()

  async function toConversation(c, me) {
    const last = await db.prepare('SELECT text, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1').get(c.id)
    const unreadRow = await db.prepare('SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL').get(c.id, me)
    return {
      id: c.id,
      title: c.buyer_id === me ? c.shop_name : c.buyer_name,
      productName: c.product_name, lastMessage: last?.text ?? null, lastAt: last?.created_at ?? null, unread: Number(unreadRow?.n ?? 0),
    }
  }

  async function accessible(id, me) {
    const c = await db.prepare(`${CONV_SELECT} WHERE c.id = ?`).get(id)
    if (!c || (c.buyer_id !== me && c.owner_id !== me)) throw new HttpError(404, 'Conversation introuvable.')
    return c
  }

  r.get('/conversations', async (req, res) => {
    const rows = await db.prepare(`${CONV_SELECT}
      WHERE c.buyer_id = ? OR (s.owner_id = ? AND c.last_message_at IS NOT NULL)
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC LIMIT 200`).all(req.user.id, req.user.id)
    res.json(await Promise.all(rows.map((c) => toConversation(c, req.user.id))))
  })

  r.post('/conversations', async (req, res) => {
    const b = conversationSchema.parse(req.body)
    const shop = await db.prepare('SELECT * FROM shops WHERE id = ?').get(b.shopId)
    if (!shop) throw new HttpError(404, 'Boutique introuvable.')
    if (shop.owner_id === req.user.id) throw new HttpError(400, 'Vous ne pouvez pas vous écrire à vous-même.')
    if (b.productId && !await db.prepare('SELECT 1 FROM products WHERE id = ? AND shop_id = ?').get(b.productId, shop.id))
      throw new HttpError(400, "Ce produit n'appartient pas à cette boutique.")
    let existing = await db.prepare('SELECT id FROM conversations WHERE buyer_id = ? AND shop_id = ?').get(req.user.id, shop.id)
    let status = 200
    if (existing) {
      if (b.productId) await db.prepare('UPDATE conversations SET product_id = ? WHERE id = ?').run(b.productId, existing.id)
    } else {
      existing = { id: uid() }
      await db.prepare('INSERT INTO conversations (id, buyer_id, shop_id, product_id, created_at) VALUES (?, ?, ?, ?, ?)').run(existing.id, req.user.id, shop.id, b.productId ?? null, now())
      status = 201
    }
    const conv = await db.prepare(`${CONV_SELECT} WHERE c.id = ?`).get(existing.id)
    res.status(status).json(await toConversation(conv, req.user.id))
  })

  r.get('/conversations/:id', async (req, res) => {
    const c = await accessible(req.params.id, req.user.id)
    await db.prepare('UPDATE messages SET read_at = ? WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL').run(now(), c.id, req.user.id)
    const msgs = await db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 500').all(c.id)
    res.json({
      conversation: await toConversation(c, req.user.id),
      messages: msgs.map((m) => ({ id: m.id, text: m.text, createdAt: m.created_at, mine: m.sender_id === req.user.id })),
    })
  })

  r.post('/conversations/:id/messages', async (req, res) => {
    const c = await accessible(req.params.id, req.user.id)
    const { text } = messageSchema.parse(req.body)
    const id = uid(), at = now()
    await db.transaction(async (client) => {
      const cp = (sql) => db.prepareOnClient(client, sql)
      await cp('INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES (?, ?, ?, ?, ?)').run(id, c.id, req.user.id, text, at)
      await cp('UPDATE conversations SET last_message_at = ? WHERE id = ?').run(at, c.id)
      const recipientIsBuyer = c.owner_id === req.user.id
      const recipient = recipientIsBuyer ? c.buyer_id : c.owner_id
      const link = recipientIsBuyer ? `/messages/${c.id}` : `/seller/messages/${c.id}`
      const preview = text.length > 100 ? `${text.slice(0, 100)}…` : text
      const sender = recipientIsBuyer ? c.shop_name : `${req.user.firstName} ${req.user.lastName}`
      const unread = await cp('SELECT id FROM notifications WHERE user_id = ? AND link = ? AND read = 0').get(recipient, link)
      if (unread) await cp('UPDATE notifications SET title = ?, body = ?, created_at = ? WHERE id = ?').run(`Nouveau message de ${sender}`, preview, at, unread.id)
      else await createNotification(db, recipient, { title: `Nouveau message de ${sender}`, body: preview, link })
    })
    res.status(201).json({ id, text, createdAt: at, mine: true })
  })

  return r
}

export function notificationRoutes({ db }) {
  const r = Router()

  r.get('/notifications', async (req, res) => {
    const rows = await db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(req.user.id)
    res.json(rows.map((n) => ({ id: n.id, title: n.title, body: n.body, link: n.link, read: !!n.read, createdAt: n.created_at })))
  })

  r.post('/notifications/read-all', async (req, res) => {
    await db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id)
    res.status(204).end()
  })

  r.patch('/notifications/:id/read', async (req, res) => {
    await db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
    res.status(204).end()
  })

  r.get('/me/counters', async (req, res) => {
    const me = req.user.id
    const [notifRow, msgRow] = await Promise.all([
      db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read = 0').get(me),
      db.prepare(`SELECT COUNT(*) AS n FROM messages m
        JOIN conversations c ON c.id = m.conversation_id JOIN shops s ON s.id = c.shop_id
        WHERE (c.buyer_id = ? OR s.owner_id = ?) AND m.sender_id != ? AND m.read_at IS NULL`).get(me, me, me),
    ])
    res.json({ notifications: Number(notifRow?.n ?? 0), messages: Number(msgRow?.n ?? 0) })
  })

  return r
}
