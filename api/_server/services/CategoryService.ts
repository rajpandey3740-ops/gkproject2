import { Category } from '../models/Product';
import CategoryModel from '../models/CategoryModel';
import { categories as fallbackCategories } from '../data/categoriesData';
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
      if (!this.isMongoConnected()) {
        console.log('MongoDB not connected, using fallback categories');
        if (includeAll) {
          return [
            { id: 'all', name: 'All Products', icon: '🛒' },
            ...fallbackCategories as Category[]
          ];
        }
        return fallbackCategories as Category[];
      }

      const categories = await CategoryModel.find().lean();
      
      if (includeAll) {
        return [
          { id: 'all', name: 'All Products', icon: '🛒' },
          ...categories as unknown as Category[]
        ];
      }
      return categories as unknown as Category[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (includeAll) {
        return [
          { id: 'all', name: 'All Products', icon: '🛒' },
          ...fallbackCategories as Category[]
        ];
      }
      return fallbackCategories as Category[];
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
      
      if (!this.isMongoConnected()) {
        const category = fallbackCategories.find(c => c.id === id);
        return category as Category || null;
      }

      const category = await CategoryModel.findOne({ id }).lean();
      return category as unknown as Category | null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      const category = fallbackCategories.find(c => c.id === id);
      return category as unknown as Category || null;
    }
  }

  /**
   * Check if category exists
   */
  async categoryExists(id: string): Promise<boolean> {
    try {
      if (id === 'all') return true;
      
      if (!this.isMongoConnected()) {
        return fallbackCategories.some(c => c.id === id);
      }

      const count = await CategoryModel.countDocuments({ id });
      return count > 0;
    } catch (error) {
      console.error('Error checking category existence:', error);
      return fallbackCategories.some(c => c.id === id);
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: Category): Promise<Category> {
    try {
      const category = new CategoryModel(categoryData);
      await category.save();
      return category.toObject() as unknown as Category;
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
