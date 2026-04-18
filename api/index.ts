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

// Add a simple ping route directly to the app
app.get('/api/ping', (_req, res) => {
  res.json({ status: 'pong', timestamp: new Date().toISOString() });
});

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
  const PORT = Number(process.env.PORT) || 3002;
  app.listen(PORT, () => {
    Logger.info(`✅ Local server running on http://localhost:${PORT}`);
  });
}
