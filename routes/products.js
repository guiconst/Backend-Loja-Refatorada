import { Router } from 'express'
import {
    listProducts,
    getProduct,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleActive,
} from '../controllers/productController.js'

const router = Router()

router.get('/', listProducts)
router.get('/slug/:slug', getProductBySlug)
router.get('/:id', getProduct)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)
router.patch('/:id/toggle', toggleActive)

export default router
