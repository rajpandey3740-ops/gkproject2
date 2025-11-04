import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

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
}
