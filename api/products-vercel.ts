import { VercelRequest, VercelResponse } from '@vercel/node';
import { products } from './data/productsData';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Return all products
      res.status(200).json({
        success: true,
        count: products.length,
        data: products.slice(0, 20) // Return first 20 products to avoid large payloads
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
}