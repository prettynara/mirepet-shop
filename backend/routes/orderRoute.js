import express from 'express';
import { createOrder, getMyOrders, getMyOrdersCount, updateOrderStatus } from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createOrder); // allow guest orders as well
router.get('/mine', authMiddleware, getMyOrders);
router.get('/mine/count', authMiddleware, getMyOrdersCount);
router.put('/:id/status', authMiddleware, updateOrderStatus);

export default router;