import express from 'express';
import { Application, Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import productRoutes from '../routes/productRoutes';
import categoryRoutes from '../routes/categoryRoutes';
import orderRoutes from '../routes/orderRoutes';
import authRoutes from '../routes/authRoutes';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
  });

  // Create a combined router for all API routes
  const apiRouter = Router();

  // Health check endpoint
  apiRouter.get('/health', (_req: Request, res: Response) => {
    return res.json({
      success: true,
      message: 'API is running',
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  // Diagnostic endpoint
  apiRouter.get('/diag', (_req: Request, res: Response) => {
    return res.json({
      success: true,
      info: {
        node_env: process.env.NODE_ENV,
        has_mongo_uri: !!process.env.MONGODB_URI,
        cwd: process.cwd(),
        dirname: __dirname,
      }
    });
  });

  // Routes
  apiRouter.use('/products', productRoutes);
  apiRouter.use('/categories', categoryRoutes);
  apiRouter.use('/orders', orderRoutes);
  apiRouter.use('/auth', authRoutes);

  // Mount the router at both /api and /
  // This ensures it works locally (/api/products) and on Vercel (/api/products -> function -> /products)
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // Debug catch-all for /api routes
  app.use('/api/*', (req: Request, res: Response) => {
    console.log(`[DEBUG] Unmatched API route: ${req.method} ${req.originalUrl}`);
    return res.status(404).json({
      success: false,
      error: 'API route not found',
      path: req.originalUrl,
      method: req.method
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    if (_req.path.startsWith('/api')) {
      return res.status(404).json({
        success: false,
        error: 'API path not found'
      });
    }
    return res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  });

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: 'Internal server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  return app;
}