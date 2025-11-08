import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import productRoutes from '../routes/productRoutes';
import categoryRoutes from '../routes/categoryRoutes';
import orderRoutes from '../routes/orderRoutes';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    return res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString()
    });
  });

  // Simple test endpoint for Vercel
  app.get('/api/test', (_req: Request, res: Response) => {
    return res.json({
      success: true,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    });
  });

  // Routes
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    return res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message
    });
  });

  return app;
}