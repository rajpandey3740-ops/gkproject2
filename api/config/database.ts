import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gkshop';
  
  try {
    // Check if we're using MongoDB Atlas (cloud)
    const isAtlas = mongoURI.includes('mongodb+srv');
    
    // MongoDB connection options
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 30000, // 30 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    };
    
    // Add additional options for Atlas connections
    if (isAtlas) {
      options.family = 4; // Use IPv4, skip trying IPv6 (fixes some DNS issues)
    }
    
    await mongoose.connect(mongoURI, options);
    
    logger.info('✅ MongoDB connected successfully');
    logger.info(`📦 Database: ${mongoose.connection.name}`);
    logger.info(`🔗 Connection type: ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);
    
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:');
    logger.error(error instanceof Error ? error.message : String(error));
    logger.warn('⚠️  Falling back to in-memory data storage');
    throw error;
  }
};