import * as dotenv from 'dotenv';
import { createApp } from './_server/config/app';
import { connectDatabase } from './_server/config/database';
import { initializeFirebase } from './_server/config/firebase';
import { Logger } from './_server/utils/logger';

// Load environment variables for local development
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

// Connect to database (non-blocking - app continues even if DB fails)
connectDatabase()
  .then(() => {
    Logger.info('✅ Database connection established');
  })
  .catch((err: unknown) => {
    Logger.error('❌ Database connection failed, continuing with fallback data:', err);
  });

// Export for Vercel serverless functions (if needed)
export default app;

// Start server for both local development and production (Railway)
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  Logger.info(`✅ Server running on port ${PORT}`);
  Logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    Logger.info(`🔗 Local: http://localhost:${PORT}`);
  }
});
