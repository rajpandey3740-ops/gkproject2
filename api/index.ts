import dotenv from 'dotenv';
import { createApp } from './config/app';
import { connectDatabase } from './config/database';

// Load environment variables
dotenv.config();

// Create the Express app instance
const app = createApp();

// Set port
const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB (optional for testing)
    try {
      await connectDatabase();
      console.log('✅ MongoDB connected successfully');
    } catch (dbError) {
      console.warn('⚠️  MongoDB connection failed - running in standalone mode with in-memory data');
      console.warn('   To use MongoDB, please ensure it is installed and running');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
