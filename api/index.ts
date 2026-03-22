import * as dotenv from 'dotenv';
import { createApp } from '../server/config/app';
import { connectDatabase } from '../server/config/database';
import { initializeFirebase } from '../server/config/firebase';
import { Logger } from '../server/utils/logger';

// Load environment variables
dotenv.config();

Logger.info(`Starting API in ${process.env.NODE_ENV || 'development'} mode`);

// Initialize Firebase safely
try {
  initializeFirebase();
} catch (error) {
  Logger.error('Firebase initialization failed:', error);
}

// Create the Express app instance
const app = createApp();

// Connect to database
// We don't await here to avoid blocking Vercel startup, 
// but we log the connection status.
connectDatabase().then(() => {
  Logger.info('Database connection established');
}).catch((err: unknown) => {
  Logger.error('Database connection failed:', err);
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
