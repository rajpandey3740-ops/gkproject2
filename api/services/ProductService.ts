import { Product } from '../models/Product';
import ProductModel from '../models/ProductModel';
import { products as inMemoryProducts } from '../data/productsData';
import mongoose from 'mongoose';

export class ProductService {
  /**
   * Check if MongoDB is connected
   */
  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Generate a unique product ID
   */
  private generateProductId(): number {
    // For MongoDB, we can use timestamp-based ID
    // For in-memory, we'll use a simple incrementing ID
    return Date.now() % 1000000;
  }

  /**
   * Get all products with optional filtering
   */
  async getAllProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      // Use in-memory data if MongoDB is not connected
      if (!this.isMongoConnected()) {
        let filtered = [...inMemoryProducts];
        
        if (category && category !== 'all') {
          filtered = filtered.filter(p => p.category === category);
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower)
          );
        }
        
        return filtered;
      }
      
      let query: any = {};
      
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      
      const products = await ProductModel.find(query).lean();
      return products as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      // Use in-memory data if MongoDB is not connected
      if (!this.isMongoConnected()) {
        return inMemoryProducts.find(p => p.id === id) || null;
      }
      
      const product = await ProductModel.findOne({ id }).lean();
      return product as Product | null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      // Use in-memory data if MongoDB is not connected
      if (!this.isMongoConnected()) {
        return inMemoryProducts.filter(p => p.category === category);
      }
      
      const products = await ProductModel.find({ category }).lean();
      return products as Product[];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<Product[]> {
    try {
      // Use in-memory data if MongoDB is not connected
      if (!this.isMongoConnected()) {
        const searchLower = query.toLowerCase();
        return inMemoryProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }
      
      const products = await ProductModel.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).lean();
      return products as Product[];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get featured/discounted products
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      // Use in-memory data if MongoDB is not connected
      if (!this.isMongoConnected()) {
        return [...inMemoryProducts]
          .sort((a, b) => b.discount - a.discount)
          .slice(0, limit);
      }
      
      const products = await ProductModel.find()
        .sort({ discount: -1 })
        .limit(limit)
        .lean();
      return products as Product[];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      // Calculate discount if both prices are provided
      if (productData.originalPrice && productData.price) {
        const originalPrice = parseFloat(productData.originalPrice as any);
        const price = parseFloat(productData.price as any);
        if (!isNaN(originalPrice) && !isNaN(price) && originalPrice >= price) {
          productData.discount = originalPrice - price;
        }
      }

      // Use in-memory storage if MongoDB is not connected
      if (!this.isMongoConnected()) {
        // Generate ID if not provided
        const id = productData.id || this.generateProductId();
        
        // Ensure all required fields are present
        const newProduct: Product = {
          id,
          name: productData.name || '',
          category: productData.category || '',
          price: productData.price || 0,
          originalPrice: productData.originalPrice || 0,
          discount: productData.discount || 0,
          image: productData.image || '',
          description: productData.description || '',
          unit: productData.unit || 'pcs',
          inStock: productData.inStock !== undefined ? productData.inStock : true
        };
        
        inMemoryProducts.unshift(newProduct);
        return newProduct;
      }
      
      // Generate ID if not provided
      const id = productData.id || this.generateProductId();
      
      // Ensure all required fields are present
      const newProduct: Product = {
        id,
        name: productData.name || '',
        category: productData.category || '',
        price: productData.price || 0,
        originalPrice: productData.originalPrice || 0,
        discount: productData.discount || 0,
        image: productData.image || '',
        description: productData.description || '',
        unit: productData.unit || 'pcs',
        inStock: productData.inStock !== undefined ? productData.inStock : true
      };
      
      const product = new ProductModel(newProduct);
      await product.save();
      return product.toObject() as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update a product
   */
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | null> {
    try {
      // Calculate discount if both prices are provided
      if (productData.originalPrice !== undefined && productData.price !== undefined) {
        const originalPrice = parseFloat(productData.originalPrice as any);
        const price = parseFloat(productData.price as any);
        if (!isNaN(originalPrice) && !isNaN(price) && originalPrice >= price) {
          productData.discount = originalPrice - price;
        }
      }

      // Use in-memory storage if MongoDB is not connected
      if (!this.isMongoConnected()) {
        const productIndex = inMemoryProducts.findIndex(p => p.id === id);
        if (productIndex !== -1) {
          inMemoryProducts[productIndex] = {
            ...inMemoryProducts[productIndex],
            ...productData
          };
          return inMemoryProducts[productIndex];
        }
        return null;
      }

      const product = await ProductModel.findOneAndUpdate(
        { id },
        productData,
        { new: true, runValidators: true }
      ).lean();
      return product as Product | null;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      // Use in-memory storage if MongoDB is not connected
      if (!this.isMongoConnected()) {
        const index = inMemoryProducts.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        inMemoryProducts.splice(index, 1);
        return true;
      }
      
      const result = await ProductModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}