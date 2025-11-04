import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gkshop';
  
  try {
    // MongoDB connection options to handle DNS issues
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
      family: 4, // Use IPv4, skip trying IPv6 (fixes some DNS issues)
    });
    
    logger.info('✅ MongoDB connected successfully');
    logger.info(`📦 Database: ${mongoose.connection.name}`);
    
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
    throw error;
  }
};
