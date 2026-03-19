import { Product } from '../models/Product';
import ProductModel from '../models/ProductModel';
import { products as fallbackProducts } from '../data/productsData';
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
    return Date.now() % 1000000;
  }

  /**
   * Get all products with optional filtering
   */
  async getAllProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      if (!this.isMongoConnected()) {
        console.log('MongoDB not connected, using fallback products');
        let filtered = [...fallbackProducts];
        if (category && category !== 'all') {
          filtered = filtered.filter(p => p.category === category);
        }
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
          );
        }
        return filtered as Product[];
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
      // Final fallback if DB query fails
      return fallbackProducts as Product[];
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      if (!this.isMongoConnected()) {
        const product = fallbackProducts.find(p => p.id === id);
        return product as Product || null;
      }
      const product = await ProductModel.findOne({ id }).lean();
      return product as Product | null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      const product = fallbackProducts.find(p => p.id === id);
      return product as Product || null;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      if (!this.isMongoConnected()) {
        return fallbackProducts.filter(p => p.category === category) as Product[];
      }
      const products = await ProductModel.find({ category }).lean();
      return products as Product[];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return fallbackProducts.filter(p => p.category === category) as Product[];
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<Product[]> {
    try {
      if (!this.isMongoConnected()) {
        const searchLower = query.toLowerCase();
        return fallbackProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        ) as Product[];
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
      return [];
    }
  }

  /**
   * Get featured/discounted products
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      if (!this.isMongoConnected()) {
        return [...fallbackProducts]
          .sort((a, b) => (b.discount || 0) - (a.discount || 0))
          .slice(0, limit) as Product[];
      }
      const products = await ProductModel.find()
        .sort({ discount: -1 })
        .limit(limit)
        .lean();
      return products as Product[];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return fallbackProducts.slice(0, limit) as Product[];
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
      const result = await ProductModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}