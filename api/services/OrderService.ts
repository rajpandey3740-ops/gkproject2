import { Order } from '../models/Order';
import OrderModel from '../models/OrderModel';
import mongoose from 'mongoose';

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
