import mongoose from 'mongoose';
import { Logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gkshop';
  
  // Log the connection string (without credentials) for debugging
  Logger.info(`Attempting to connect to MongoDB: ${mongoURI.replace(/\/\/.*@/, '//****:****@')}`);
  
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
    
    Logger.info('✅ MongoDB connected successfully');
    Logger.info(`📦 Database: ${mongoose.connection.name}`);
    Logger.info(`🔗 Connection type: ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);
    
    mongoose.connection.on('error', (error) => {
      Logger.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      Logger.warn('MongoDB disconnected');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      Logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    Logger.error('Failed to connect to MongoDB:');
    Logger.error(error instanceof Error ? error.message : String(error));
    Logger.error('❌ CRITICAL: MongoDB Atlas connection failed - exiting application');
    process.exit(1); // Exit the application if MongoDB connection fails
  }
};