import { Order } from '../models/Order';
import OrderModel from '../models/OrderModel';
import mongoose from 'mongoose';

// In-memory orders storage for when MongoDB is not available
let inMemoryOrders: Order[] = [];

export class OrderService {
  /**
   * Check if MongoDB is connected
   */
  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Generate unique order ID
   */
  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD${timestamp}${random}`;
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Order> {
    try {
      const orderId = this.generateOrderId();
      const now = new Date();
      
      const newOrder: Order = {
        ...orderData,
        orderId,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };

      // Use in-memory storage if MongoDB is not connected
      if (!this.isMongoConnected()) {
        inMemoryOrders.unshift(newOrder);
        return newOrder;
      }

      const order = new OrderModel(newOrder);
      await order.save();
      return order.toObject() as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get all orders (optionally filtered by username)
   */
  async getAllOrders(username?: string): Promise<Order[]> {
    try {
      // Use in-memory storage if MongoDB is not connected
      if (!this.isMongoConnected()) {
        if (username) {
          return inMemoryOrders.filter(order => order.username === username);
        }
        return inMemoryOrders;
      }

      const query = username ? { username } : {};
      const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
      return orders as Order[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      // Use in-memory storage if MongoDB is not connected
      if (!this.isMongoConnected()) {
        return inMemoryOrders.find(order => order.orderId === orderId) || null;
      }

      const order = await OrderModel.findOne({ orderId }).lean();
      return order as Order | null;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    try {
      // Use in-memory storage if MongoDB is not connected
      if (!this.isMongoConnected()) {
        const orderIndex = inMemoryOrders.findIndex(order => order.orderId === orderId);
        if (orderIndex !== -1) {
          inMemoryOrders[orderIndex] = {
            ...inMemoryOrders[orderIndex],
            status,
            updatedAt: new Date()
          };
          return inMemoryOrders[orderIndex];
        }
        return null;
      }

      const order = await OrderModel.findOneAndUpdate(
        { orderId },
        { status, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();
      return order as Order | null;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<Order | null> {
    return this.updateOrderStatus(orderId, 'cancelled');
  }
}
