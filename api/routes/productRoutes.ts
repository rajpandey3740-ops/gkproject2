import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

const productRouter = Router();
const productController = new ProductController();

// GET /api/products/featured - Must be before /:id to avoid route conflict
productRouter.get('/featured', (req, res) => productController.getFeaturedProducts(req, res));

// GET /api/products/search
productRouter.get('/search', (req, res) => productController.searchProducts(req, res));

// GET /api/products/category/:category
productRouter.get('/category/:category', (req, res) => productController.getProductsByCategory(req, res));

// GET /api/products - Get all products with optional filters
productRouter.get('/', (req, res) => productController.getProducts(req, res));

// GET /api/products/:id - Get single product
productRouter.get('/:id', (req, res) => productController.getProductById(req, res));

// PATCH /api/products/:id - Update product (owner only)
productRouter.patch('/:id', (req, res) => productController.updateProduct(req, res));

export default productRouter;
