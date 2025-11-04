import dotenv from 'dotenv';
import { createApp } from './config/app';
import { connectDatabase } from './config/database';

// Load environment variables
dotenv.config();

// Create the Express app instance
const app = createApp();

// Connect to database
connectDatabase().catch(err => {
  console.warn('⚠️  MongoDB connection failed - running in standalone mode with in-memory data');
  console.warn('   To use MongoDB, please ensure it is installed and running');
});

// Export for Vercel serverless functions
export default app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });
}
