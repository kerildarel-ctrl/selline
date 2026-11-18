import pg from 'pg'
const { Pool } = pg

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  city TEXT,
  avatar TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer',
  is_admin INTEGER NOT NULL DEFAULT 0,
  blocked INTEGER NOT NULL DEFAULT 0,
  email_verified INTEGER NOT NULL DEFAULT 0,
  verify_token TEXT,
  verify_token_expires_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  phone TEXT,
  description TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  suspended INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0,
  free_shipping INTEGER NOT NULL DEFAULT 1,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  quarter TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, product_id)
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal INTEGER NOT NULL,
  shipping_fee INTEGER NOT NULL,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_phone TEXT,
  address_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at);
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  shop_id TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  shipping_fee INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);
CREATE TABLE IF NOT EXISTS order_shops (
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shop_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  PRIMARY KEY (order_id, shop_id)
);
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (product_id, user_id)
);
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  last_message_at TEXT,
  UNIQUE (buyer_id, shop_id)
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  read_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
CREATE TABLE IF NOT EXISTS admin_actions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id, read, created_at);
`

export async function openDb(connectionString) {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })
  const client = await pool.connect()
  try { await client.query(SCHEMA) }
  finally { client.release() }

  function pgSql(sql) {
    let i = 0
    return sql.replace(/\?/g, () => `$${++i}`)
  }

  function prepare(sql) {
    const pgQuery = pgSql(sql)
    return {
      async get(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args
        const { rows } = await pool.query(pgQuery, params)
        return rows[0] ?? null
      },
      async all(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args
        const { rows } = await pool.query(pgQuery, params)
        return rows
      },
      async run(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args
        await pool.query(pgQuery, params)
        return { changes: 1 }
      },
    }
  }

  async function transaction(fn) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const result = await fn(client)
      await client.query('COMMIT')
      return result
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  function prepareOnClient(client, sql) {
    const pgQuery = pgSql(sql)
    return {
      async get(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args
        const { rows } = await client.query(pgQuery, params)
        return rows[0] ?? null
      },
      async all(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args
        const { rows } = await client.query(pgQuery, params)
        return rows
      },
      async run(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args
        await client.query(pgQuery, params)
        return { changes: 1 }
      },
    }
  }

  async function end() { await pool.end() }

  return { prepare, transaction, prepareOnClient, end, pool }
}

export const CATEGORIES = [
  ['cat-telephones', 'Téléphones', 'telephones'],
  ['cat-mode', 'Mode', 'mode'],
  ['cat-maison', 'Maison', 'maison'],
  ['cat-beaute', 'Beauté', 'beaute'],
  ['cat-informatique', 'Informatique', 'informatique'],
  ['cat-alimentation', 'Alimentation', 'alimentation'],
  ['cat-automobile', 'Automobile', 'automobile'],
  ['cat-autre', 'Autre', 'autre'],
]

export async function ensureCategories(db) {
  for (const [id, name, slug] of CATEGORIES) {
    await db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?) ON CONFLICT DO NOTHING').run(id, name, slug)
  }
}
