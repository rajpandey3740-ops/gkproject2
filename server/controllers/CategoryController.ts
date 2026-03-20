import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { Category } from '../models/Product';

const categoryService = new CategoryService();

export class CategoryController {
  /**
   * GET /api/categories
   * Get all categories
   */
  async getCategories(req: Request, res: Response) {
    try {
      const includeAll = req.query.includeAll !== 'false';
      const categories = await categoryService.getAllCategories(includeAll);
      
      return res.json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      });
    }
  }

  /**
   * GET /api/categories/:id
   * Get a single category by ID
   */
  async getCategoryById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const category = await categoryService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
      
      return res.json({
        success: true,
        data: category
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch category'
      });
    }
  }

  /**
   * POST /api/categories
   * Create a new category
   */
  async createCategory(req: Request, res: Response) {
    try {
      const categoryData: Partial<Category> = req.body;
      
      // Validate required fields
      if (!categoryData.name) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: name is required'
        });
      }
      
      // Generate category ID from name if not provided
      if (!categoryData.id) {
        categoryData.id = categoryData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      
      // Set default icon if not provided
      if (!categoryData.icon) {
        categoryData.icon = '🛒';
      }
      
      // Check if category already exists
      const exists = await categoryService.categoryExists(categoryData.id);
      if (exists) {
        return res.status(400).json({
          success: false,
          error: 'Category with this ID already exists'
        });
      }
      
      // Create the category
      const category = await categoryService.createCategory(categoryData as Category);
      
      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create category'
      });
    }
  }
}