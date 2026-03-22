import { createApp } from '../server/config/app';
import { connectDatabase } from '../server/config/database';
import { initializeFirebase } from '../server/config/firebase';
import { Logger } from '../server/utils/logger';

// Initialize Firebase safely
try {
  initializeFirebase();
} catch (error) {
  Logger.error('Firebase initialization failed:', error);
}

// Create the Express app instance
const app = createApp();

// Connect to database
connectDatabase().then(() => {
  Logger.info('✅ Database connection established');
}).catch((err: unknown) => {
  Logger.error('❌ Database connection failed:', err);
});

// Export for Vercel serverless functions
export default app;

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT) || 3001;
  app.listen(PORT, () => {
    Logger.info(`✅ Local server running on http://localhost:${PORT}`);
  });
}
