import * as dotenv from 'dotenv';
import { createApp } from './config/app';
import { connectDatabase } from './config/database';
import { initializeFirebase } from './config/firebase';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Firebase
initializeFirebase();

// Create the Express app instance
const app = createApp();

// Connect to database with fallback
connectDatabase().catch((err: any) => {
  logger.warn('⚠️  MongoDB connection failed - running in standalone mode with in-memory data');
  logger.warn('   To use MongoDB, please ensure it is installed and running');
  logger.warn('   Or configure MongoDB Atlas connection in .env file');
  logger.error('MongoDB connection error:', err instanceof Error ? err.message : String(err));
});

// Export for Vercel serverless functions
export default app;

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    logger.info(`✅ Server is running on http://localhost:${PORT}`);
    logger.info(`📡 API available at http://localhost:${PORT}/api`);
    logger.info(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });
}