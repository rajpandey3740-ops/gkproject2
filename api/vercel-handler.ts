import type { VercelRequest, VercelResponse } from '@vercel/node';
import { products } from './data/productsData';
import { categories } from './data/categoriesData';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Parse the URL to determine which endpoint to handle
    const path = (req.query.path as string[]) || [];
    
    // Handle different API endpoints
    if (path[0] === 'products') {
      handleProducts(req, res, path);
    } else if (path[0] === 'categories') {
      handleCategories(req, res, path);
    } else if (path[0] === 'health') {
      res.status(200).json({
        success: true,
        message: 'Health check successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

function handleProducts(req: VercelRequest, res: VercelResponse, path: string[]): void {
  try {
    if (req.method === 'GET') {
      // Handle single product by ID
      if (path[1]) {
        const productId = parseInt(path[1]);
        const product = products.find(p => p.id === productId);
        if (product) {
          res.status(200).json({
            success: true,
            data: product
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Product not found'
          });
        }
        return;
      }
      
      // Handle products with filters
      let filteredProducts = [...products];
      
      // Handle category filter
      const category = req.query.category as string;
      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      // Handle search query
      const search = req.query.search as string;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
        );
      }
      
      res.status(200).json({
        success: true,
        count: filteredProducts.length,
        data: filteredProducts
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Products API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
}

function handleCategories(req: VercelRequest, res: VercelResponse, path: string[]): void {
  try {
    if (req.method === 'GET') {
      // Handle single category by ID
      if (path[1]) {
        const categoryId = path[1];
        if (categoryId === 'all') {
          res.status(200).json({
            success: true,
            data: { id: 'all', name: 'All Products', icon: '🛒' }
          });
          return;
        }
        
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          res.status(200).json({
            success: true,
            data: category
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Category not found'
          });
        }
        return;
      }
      
      // Return all categories
      const includeAll = req.query.includeAll !== 'false';
      const categoriesData = includeAll 
        ? [{ id: 'all', name: 'All Products', icon: '🛒' }, ...categories]
        : categories;
        
      res.status(200).json({
        success: true,
        count: categoriesData.length,
        data: categoriesData
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Categories API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
}