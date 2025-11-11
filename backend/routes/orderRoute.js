import express from 'express';
import { createOrder, getMyOrders, getMyOrdersCount, updateOrderStatus, getClientOrders, getOrderById, assignCourier } from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createOrder); // allow guest orders as well
router.get('/mine', authMiddleware, getMyOrders);
router.get('/mine/count', authMiddleware, getMyOrdersCount);
router.put('/:id/status', authMiddleware, updateOrderStatus);
router.put('/:id/assign-courier', authMiddleware, assignCourier);

// new: client orders (authenticated)
router.get('/client', authMiddleware, getClientOrders);
router.get('/:id', authMiddleware, getOrderById);

export default router;