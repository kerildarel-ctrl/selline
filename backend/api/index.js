import { config } from '../src/config.js'
import { ensureCategories, openDb } from '../src/db.js'
import { createApp } from '../src/app.js'
import { ensureAdmin } from '../src/admin.js'

let app = null

async function bootstrap() {
  if (app) return app
  const db = await openDb(config.databaseUrl)
  await ensureCategories(db)
  if (process.env.ADMIN_EMAIL) {
    try { await ensureAdmin(db, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD) }
    catch (e) { console.error('[admin]', e.message) }
  }
  app = createApp({ db, config })
  return app
}

export default async function handler(req, res) {
  const expressApp = await bootstrap()
  return expressApp(req, res)
}
