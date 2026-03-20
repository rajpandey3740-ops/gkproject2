import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';

const categoryRouter = Router();
const categoryController = new CategoryController();

// GET /api/categories - Get all categories
categoryRouter.get('/', (req, res) => categoryController.getCategories(req, res));

// GET /api/categories/:id - Get single category
categoryRouter.get('/:id', (req, res) => categoryController.getCategoryById(req, res));

// POST /api/categories - Create a new category
categoryRouter.post('/', (req, res) => categoryController.createCategory(req, res));

export default categoryRouter;