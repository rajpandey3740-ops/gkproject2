import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';

const orderService = new OrderService();

export class OrderController {
  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response): Promise<Response> {
    try {
      const orderData = req.body;

      // Validate required fields
      if (!orderData.items || !orderData.items.length) {
        return res.status(400).json({
          success: false,
          error: 'Order must contain at least one item'
        });
      }

      if (!orderData.address) {
        return res.status(400).json({
          success: false,
          error: 'Delivery address is required'
        });
      }

      if (!orderData.paymentMethod) {
        return res.status(400).json({
          success: false,
          error: 'Payment method is required'
        });
      }

      const order = await orderService.createOrder(orderData);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order
      });
    } catch (error: any) {
      console.error('Error in createOrder:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create order',
        message: error.message
      });
    }
  }

  /**
   * Get all orders (optionally filtered by username)
   */
  async getAllOrders(req: Request, res: Response): Promise<Response> {
    try {
      const username = req.query.username as string | undefined;
      const orders = await orderService.getAllOrders(username);

      return res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error: any) {
      console.error('Error in getAllOrders:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        message: error.message
      });
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<Response> {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      return res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('Error in getOrderById:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
        message: error.message
      });
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const order = await orderService.updateOrderStatus(orderId, status);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      return res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error: any) {
      console.error('Error in updateOrderStatus:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update order status',
        message: error.message
      });
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(req: Request, res: Response): Promise<Response> {
    try {
      const { orderId } = req.params;
      const order = await orderService.cancelOrder(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      return res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });
    } catch (error: any) {
      console.error('Error in cancelOrder:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel order',
        message: error.message
      });
    }
  }
}
