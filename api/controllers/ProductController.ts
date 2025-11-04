import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

const productService = new ProductService();

export class ProductController {
  /**
   * GET /api/products
   * Get all products with optional filters
   */
  async getProducts(req: Request, res: Response) {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      
      const products = await productService.getAllProducts(category, search);
      
      return res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products'
      });
    }
  }

  /**
   * GET /api/products/:id
   * Get a single product by ID
   */
  async getProductById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid product ID'
        });
      }
      
      const product = await productService.getProductById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      return res.json({
        success: true,
        data: product
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch product'
      });
    }
  }

  /**
   * GET /api/products/featured
   * Get featured products
   */
  async getFeaturedProducts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string || '10');
      const products = await productService.getFeaturedProducts(limit);
      
      return res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch featured products'
      });
    }
  }

  /**
   * GET /api/products/category/:category
   * Get products by category
   */
  async getProductsByCategory(req: Request, res: Response) {
    try {
      const category = req.params.category;
      const products = await productService.getProductsByCategory(category);
      
      return res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products by category'
      });
    }
  }

  /**
   * GET /api/products/search
   * Search products
   */
  async searchProducts(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }
      
      const products = await productService.searchProducts(query);
      
      return res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to search products'
      });
    }
  }

  /**
   * PATCH /api/products/:id
   * Update a product (owner only)
   */
  async updateProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid product ID'
        });
      }

      const updates = req.body;
      const product = await productService.updateProduct(id, updates);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      return res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update product'
      });
    }
  }
}
