import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductModel from '../models/ProductModel';
import CategoryModel from '../models/CategoryModel';
import { products } from '../data/productsData';
import { categories } from '../data/categoriesData';
import { logger } from '../utils/logger';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gkshop';
    
    logger.info('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    logger.info('✅ Connected to MongoDB');
    
    // Clear existing data
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    logger.info('🗑️  Cleared existing data');
    
    // Insert categories
    const insertedCategories = await CategoryModel.insertMany(categories);
    logger.info(`✅ Inserted ${insertedCategories.length} categories`);
    
    // Insert products
    const insertedProducts = await ProductModel.insertMany(products);
    logger.info(`✅ Inserted ${insertedProducts.length} products`);
    
    logger.info('🎉 Database seeded successfully!');
    
    // Display summary
    const productCount = await ProductModel.countDocuments();
    const categoryCount = await CategoryModel.countDocuments();
    
    logger.info('\n📊 Database Summary:');
    logger.info(`   Categories: ${categoryCount}`);
    logger.info(`   Products: ${productCount}`);
    
    // Close connection
    await mongoose.connection.close();
    logger.info('\n✅ Database connection closed');
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
