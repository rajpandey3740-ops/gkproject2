// Simple test file to verify API functionality
import { products } from './data/productsData';

console.log('Total products in data file:', products.length);
console.log('First product:', products[0]);

// Test importing the main app
import { createApp } from './config/app';
console.log('App module imported successfully');

// Test importing the database
import { connectDatabase } from './config/database';
console.log('Database module imported successfully');

// Test importing the logger
import { logger } from './utils/logger';
logger.info('Logger module imported successfully');

console.log('All imports successful!');