import { Router } from 'express'
import { login, logout, me } from '../controllers/authController.js'
import { requireAdmin } from '../middleware/authMiddleware.js'
import {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleActive,
} from '../controllers/productController.js'
import {
    listCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js'

const router = Router()

// ── Auth (pública) ────────────────────────────────────────────
router.post('/auth/login', login)

// ── Rotas protegidas ──────────────────────────────────────────
router.use(requireAdmin)

router.post('/auth/logout', logout)
router.get('/auth/me', me)

// Produtos (admin vê todos, inclusive inativos)
router.get('/products', (req, res, next) => {
    req.query.active = req.query.active ?? 'all'
    next()
}, listProducts)
router.get('/products/:id', getProduct)
router.post('/products', createProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)
router.patch('/products/:id/toggle', toggleActive)

// Categorias
router.get('/categories', listCategories)
router.get('/categories/:id', getCategory)
router.post('/categories', createCategory)
router.put('/categories/:id', updateCategory)
router.delete('/categories/:id', deleteCategory)

export default router