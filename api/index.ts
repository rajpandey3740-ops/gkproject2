import * as dotenv from 'dotenv';
import { createApp } from '../server/config/app';
import { connectDatabase } from '../server/config/database';
import { initializeFirebase } from '../server/config/firebase';
import { Logger } from '../server/utils/logger';

// Load environment variables only for local dev
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Initialize Firebase safely
try {
  initializeFirebase();
} catch (error) {
  Logger.error('Firebase initialization failed:', error);
}

// Create the Express app instance
const app = createApp();

// Connect to database with fallback
connectDatabase().catch((err: unknown) => {
  Logger.warn('⚠️ MongoDB connection failed - running in standalone mode with in-memory data');
  Logger.warn('   To use MongoDB, please ensure it is installed and running');
  Logger.warn('   Or configure MongoDB Atlas connection in .env file');
  Logger.error(
    'MongoDB connection error:',
    err instanceof Error ? err.message : String(err)
  );
});

// Export for Vercel serverless functions
export default app;

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT) || 3001;

  app.listen(PORT, () => {
    Logger.info(`✅ Server is running on http://localhost:${PORT}`);
    Logger.info(`📡 API available at http://localhost:${PORT}/api`);
    Logger.info(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });
}
