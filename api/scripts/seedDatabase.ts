import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductModel from '../models/ProductModel';
import CategoryModel from '../models/CategoryModel';
import { products } from '../data/productsData';
import { categories } from '../data/categoriesData';
import { Logger } from '../utils/logger';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gkshop';
    
    Logger.info('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    Logger.info('✅ Connected to MongoDB');
    
    // Clear existing data
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    Logger.info('🗑️  Cleared existing data');
    
    // Insert categories
    const insertedCategories = await CategoryModel.insertMany(categories);
    Logger.info(`✅ Inserted ${insertedCategories.length} categories`);
    
    // Insert products
    const insertedProducts = await ProductModel.insertMany(products);
    Logger.info(`✅ Inserted ${insertedProducts.length} products`);
    
    Logger.info('🎉 Database seeded successfully!');
    
    // Display summary
    const productCount = await ProductModel.countDocuments();
    const categoryCount = await CategoryModel.countDocuments();
    
    Logger.info('\n📊 Database Summary:');
    Logger.info(`   Categories: ${categoryCount}`);
    Logger.info(`   Products: ${productCount}`);
    
    // Close connection
    await mongoose.connection.close();
    Logger.info('\n✅ Database connection closed');
    process.exit(0);
    
  } catch (error) {
    Logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
