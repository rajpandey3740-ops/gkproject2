import { Category } from '../models/Product';
import CategoryModel from '../models/CategoryModel';
import { categories as inMemoryCategories } from '../data/categoriesData';
import mongoose from 'mongoose';

export class CategoryService {
  /**
   * Check if MongoDB is connected
   */
  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get all categories including 'All Products'
   */
  async getAllCategories(includeAll: boolean = true): Promise<Category[]> {
    try {
      // Use in-memory data if MongoDB is not connected
      if (!this.isMongoConnected()) {
        if (includeAll) {
          return [
            { id: 'all', name: 'All Products', icon: '🛒' },
            ...inMemoryCategories
          ];
        }
        return inMemoryCategories;
      }
      
      const categories = await CategoryModel.find().lean();
      
      if (includeAll) {
        return [
          { id: 'all', name: 'All Products', icon: '🛒' },
          ...categories as Category[]
        ];
      }
      return categories as Category[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      if (id === 'all') {
        return { id: 'all', name: 'All Products', icon: '🛒' };
      }
      
      // Use in-memory data if MongoDB is not connected
      if (!this.isMongoConnected()) {
        return inMemoryCategories.find(c => c.id === id) || null;
      }
      
      const category = await CategoryModel.findOne({ id }).lean();
      return category as Category | null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  /**
   * Check if category exists
   */
  async categoryExists(id: string): Promise<boolean> {
    try {
      if (id === 'all') return true;
      
      // Use in-memory data if MongoDB is not connected
      if (!this.isMongoConnected()) {
        return inMemoryCategories.some(c => c.id === id);
      }
      
      const count = await CategoryModel.countDocuments({ id });
      return count > 0;
    } catch (error) {
      console.error('Error checking category existence:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: Category): Promise<Category> {
    try {
      const category = new CategoryModel(categoryData);
      await category.save();
      return category.toObject() as Category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category | null> {
    try {
      const category = await CategoryModel.findOneAndUpdate(
        { id },
        categoryData,
        { new: true, runValidators: true }
      ).lean();
      return category as Category | null;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const result = await CategoryModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}
