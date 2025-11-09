import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import data - these need to be included in deployment
import { products } from './data/productsData';
import { categories } from './data/categoriesData';

// In-memory orders storage
let orders: any[] = [];

// Type definitions
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  description: string;
  unit: string;
  inStock?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  unit: string;
}

interface OrderAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pin: string;
}

interface Order {
  orderId: string;
  username?: string;
  items: OrderItem[];
  address: OrderAddress;
  paymentMethod: 'cod' | 'upi';
  subtotal: number;
  savings: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  try {
    console.log('API Request:', req.method, req.url);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Parse the URL to determine which endpoint to handle
    const url = req.url || '';
    const urlPath = url.split('?')[0]; // Remove query string
    const pathParts = urlPath.split('/').filter(p => p && p !== 'api');
    
    console.log('Request URL:', url);
    console.log('Path parts:', pathParts);
    
    // Handle different API endpoints
    if (pathParts[0] === 'products') {
      handleProducts(req, res, pathParts);
    } else if (pathParts[0] === 'categories') {
      handleCategories(req, res, pathParts);
    } else if (pathParts[0] === 'orders') {
      handleOrders(req, res, pathParts);
    } else if (pathParts[0] === 'health') {
      res.status(200).json({
        success: true,
        message: 'Health check successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: pathParts
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

function handleProducts(req: VercelRequest, res: VercelResponse, path: string[]): void {
  try {
    if (req.method === 'GET') {
      // Handle single product by ID
      if (path[1]) {
        const productId = parseInt(path[1]);
        const product = products.find(p => p.id === productId);
        if (product) {
          res.status(200).json({
            success: true,
            data: product
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Product not found'
          });
        }
        return;
      }
      
      // Handle products with filters
      let filteredProducts = [...products];
      
      // Handle category filter
      const category = req.query.category as string;
      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      // Handle search query
      const search = req.query.search as string;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
        );
      }
      
      res.status(200).json({
        success: true,
        count: filteredProducts.length,
        data: filteredProducts
      });
    } else if (req.method === 'POST') {
      // Handle creating a new product
      const newProduct = req.body;
      
      // Generate a unique ID
      const id = Date.now() % 1000000;
      
      // Calculate discount
      const price = parseFloat(newProduct.price);
      const originalPrice = parseFloat(newProduct.originalPrice);
      const discount = originalPrice - price;
      
      // Add default values if not provided
      const product = {
        id,
        ...newProduct,
        price,
        originalPrice,
        discount,
        unit: newProduct.unit || 'pcs',
        inStock: newProduct.inStock !== undefined ? newProduct.inStock : true,
        description: newProduct.description || '',
        image: newProduct.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
      };
      
      // Add to in-memory products
      products.unshift(product);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } else if (req.method === 'PATCH') {
      // Handle updating an existing product
      if (!path[1]) {
        res.status(400).json({
          success: false,
          error: 'Product ID is required for update'
        });
        return;
      }
      
      const productId = parseInt(path[1]);
      if (isNaN(productId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid product ID'
        });
        return;
      }
      
      const updates = req.body;
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex === -1) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }
      
      // Apply updates
      const updatedProduct = {
        ...products[productIndex],
        ...updates
      };
      
      // Recalculate discount if prices are updated
      if (updates.originalPrice !== undefined || updates.price !== undefined) {
        const originalPrice = parseFloat(updates.originalPrice !== undefined ? updates.originalPrice : updatedProduct.originalPrice);
        const price = parseFloat(updates.price !== undefined ? updates.price : updatedProduct.price);
        if (!isNaN(originalPrice) && !isNaN(price)) {
          updatedProduct.discount = originalPrice - price;
        }
      }
      
      // Update in-memory products
      products[productIndex] = updatedProduct;
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Products API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
}

function handleCategories(req: VercelRequest, res: VercelResponse, path: string[]): void {
  try {
    if (req.method === 'GET') {
      // Handle single category by ID
      if (path[1]) {
        const categoryId = path[1];
        if (categoryId === 'all') {
          res.status(200).json({
            success: true,
            data: { id: 'all', name: 'All Products', icon: '🛒' }
          });
          return;
        }
        
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          res.status(200).json({
            success: true,
            data: category
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Category not found'
          });
        }
        return;
      }
      
      // Return all categories
      const includeAll = req.query.includeAll !== 'false';
      const categoriesData = includeAll 
        ? [{ id: 'all', name: 'All Products', icon: '🛒' }, ...categories]
        : categories;
        
      res.status(200).json({
        success: true,
        count: categoriesData.length,
        data: categoriesData
      });
    } else if (req.method === 'POST') {
      // Handle creating a new category
      const newCategory = req.body;
      
      // Check if category already exists
      const exists = categories.some(c => c.id === newCategory.id);
      if (exists) {
        res.status(400).json({
          success: false,
          error: 'Category with this ID already exists'
        });
        return;
      }
      
      // Add to in-memory categories
      categories.push(newCategory);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: newCategory
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Categories API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
}

function handleOrders(req: VercelRequest, res: VercelResponse, path: string[]): void {
  try {
    if (req.method === 'GET') {
      // Handle single order by ID
      if (path[1]) {
        const orderId = path[1];
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
          res.status(200).json({
            success: true,
            data: order
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Order not found'
          });
        }
        return;
      }
      
      // Handle orders with filters
      let filteredOrders = [...orders];
      
      // Handle username filter
      const username = req.query.username as string;
      if (username) {
        filteredOrders = filteredOrders.filter(o => o.username === username);
      }
      
      res.status(200).json({
        success: true,
        count: filteredOrders.length,
        data: filteredOrders
      });
    } else if (req.method === 'POST') {
      // Handle creating a new order
      const orderData = req.body;
      
      console.log('Order data received:', JSON.stringify(orderData, null, 2));
      
      // Validate required fields with better error messages
      if (!orderData) {
        res.status(400).json({
          success: false,
          error: 'No order data provided'
        });
        return;
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Order must contain at least one item'
        });
        return;
      }

      if (!orderData.address) {
        res.status(400).json({
          success: false,
          error: 'Delivery address is required'
        });
        return;
      }

      if (!orderData.paymentMethod) {
        res.status(400).json({
          success: false,
          error: 'Payment method is required'
        });
        return;
      }
      
      // Validate items with detailed error messages
      for (let i = 0; i < orderData.items.length; i++) {
        const item = orderData.items[i];
        if (!item) {
          res.status(400).json({
            success: false,
            error: `Item at index ${i} is null or undefined`
          });
          return;
        }
        
        if (typeof item.id === 'undefined' || item.id === null) {
          res.status(400).json({
            success: false,
            error: `Item at index ${i} is missing id`
          });
          return;
        }
        
        if (!item.name) {
          res.status(400).json({
            success: false,
            error: `Item at index ${i} is missing name`
          });
          return;
        }
        
        if (typeof item.price !== 'number' || isNaN(item.price)) {
          res.status(400).json({
            success: false,
            error: `Item at index ${i} has invalid price: ${item.price}`
          });
          return;
        }
        
        if (typeof item.originalPrice !== 'number' || isNaN(item.originalPrice)) {
          res.status(400).json({
            success: false,
            error: `Item at index ${i} has invalid originalPrice: ${item.originalPrice}`
          });
          return;
        }
        
        if (typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
          res.status(400).json({
            success: false,
            error: `Item at index ${i} has invalid quantity: ${item.quantity}`
          });
          return;
        }
      }
      
      // Validate address with detailed error messages
      const address = orderData.address;
      if (!address.name) {
        res.status(400).json({
          success: false,
          error: 'Address is missing name'
        });
        return;
      }
      
      if (!address.phone) {
        res.status(400).json({
          success: false,
          error: 'Address is missing phone'
        });
        return;
      }
      
      if (!address.street) {
        res.status(400).json({
          success: false,
          error: 'Address is missing street'
        });
        return;
      }
      
      if (!address.city) {
        res.status(400).json({
          success: false,
          error: 'Address is missing city'
        });
        return;
      }
      
      if (!address.state) {
        res.status(400).json({
          success: false,
          error: 'Address is missing state'
        });
        return;
      }
      
      if (!address.pin) {
        res.status(400).json({
          success: false,
          error: 'Address is missing pin'
        });
        return;
      }
      
      // Generate unique order ID
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const orderId = `ORD${timestamp}${random}`;
      const now = new Date().toISOString();
      
      const newOrder: Order = {
        ...orderData,
        orderId,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };
      
      // Add to in-memory orders
      orders.unshift(newOrder);
      
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: newOrder
      });
    } else if (req.method === 'PATCH') {
      // Handle updating order status
      if (path[2] === 'status') {
        const orderId = path[1];
        const { status } = req.body;
        
        if (!status) {
          res.status(400).json({
            success: false,
            error: 'Status is required'
          });
          return;
        }
        
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        if (orderIndex !== -1) {
          orders[orderIndex] = {
            ...orders[orderIndex],
            status,
            updatedAt: new Date().toISOString()
          };
          
          res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: orders[orderIndex]
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Order not found'
          });
        }
        return;
      }
      
      res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Orders API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
