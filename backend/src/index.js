import { config } from './config.js'
import { ensureCategories, openDb } from './db.js'
import { createApp } from './app.js'
import { seedDemo } from './seed.js'
import { ensureAdmin } from './admin.js'

const db = await openDb(config.databaseUrl)
await ensureCategories(db)

if (config.seedDemo && await seedDemo(db, config)) {
  console.log('🌱 Données de démonstration créées : demo@selline.cm / vendeur@selline.cm / admin@selline.cm (mot de passe : demo1234)')
}

if (process.env.ADMIN_EMAIL) {
  try { console.log(`👑 ${process.env.ADMIN_EMAIL} : ${await ensureAdmin(db, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)}`) }
  catch (e) { console.error(`⚠️  Administrateur non configuré : ${e.message}`) }
}

const server = createApp({ db, config }).listen(config.port, () => {
  console.log(`✅ API Selline sur http://localhost:${config.port}/api  (base : PostgreSQL/Neon)`)
})

const stop = async () => { server.close(); await db.end(); process.exit(0) }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
