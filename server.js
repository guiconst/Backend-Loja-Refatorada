import 'dotenv/config'
import express from 'express'
import productsRouter from './routes/products.js'
import categoriesRouter from './routes/categories.js'
import adminRouter from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 3000

// ── Middlewares ───────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
})

// ── Rotas ─────────────────────────────────────────────────────
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/admin', adminRouter)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// 404
app.use((req, res) => res.status(404).json({ error: `Rota ${req.path} não encontrada` }))

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 B7Store API rodando em http://localhost:${PORT}`)
    console.log(`\n📋 Rotas públicas:`)
    console.log(`   GET    /api/products`)
    console.log(`   GET    /api/products/:id`)
    console.log(`   GET    /api/products/slug/:slug`)
    console.log(`   GET    /api/categories`)
    console.log(`\n🔐 Rotas admin (requerem Bearer token):`)
    console.log(`   POST   /api/admin/auth/login`)
    console.log(`   POST   /api/admin/auth/logout`)
    console.log(`   GET    /api/admin/auth/me`)
    console.log(`   GET    /api/admin/products  (inclui inativos)`)
    console.log(`   POST   /api/admin/products`)
    console.log(`   PUT    /api/admin/products/:id`)
    console.log(`   DELETE /api/admin/products/:id`)
    console.log(`   PATCH  /api/admin/products/:id/toggle`)
    console.log(`   GET    /api/admin/categories`)
    console.log(`   POST   /api/admin/categories`)
    console.log(`   PUT    /api/admin/categories/:id`)
    console.log(`   DELETE /api/admin/categories/:id`)
})