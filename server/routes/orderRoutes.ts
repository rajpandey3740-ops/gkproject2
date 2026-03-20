import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';

const router = Router();
const orderController = new OrderController();

// Create a new order
router.post('/', (req, res) => orderController.createOrder(req, res));

// Get all orders (optionally filtered by username)
router.get('/', (req, res) => orderController.getAllOrders(req, res));

// Get a single order by ID
router.get('/:orderId', (req, res) => orderController.getOrderById(req, res));

// Update order status
router.patch('/:orderId/status', (req, res) => orderController.updateOrderStatus(req, res));

// Cancel an order
router.patch('/:orderId/cancel', (req, res) => orderController.cancelOrder(req, res));

export default router;
