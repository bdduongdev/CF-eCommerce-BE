import express from 'express';
import { verifyToken, isCustomer, isAdmin } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  createOrderFromCart,
  createOrderDirect,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/OrderController.js';
import {
  createOrderFromCartSchema,
  createOrderDirectSchema,
  cancelOrderSchema,
  getAllOrdersSchema,
  getOrderByIdSchema,
  updateOrderStatusSchema
} from '../validations/order.validation.js';

const router = express.Router();

router.post('/from-cart', verifyToken, isCustomer, validate(createOrderFromCartSchema), createOrderFromCart);
router.post('/direct', verifyToken, isCustomer, validate(createOrderDirectSchema), createOrderDirect);
router.get('/', verifyToken, isCustomer, getUserOrders);
router.get('/:orderId', verifyToken, isCustomer, getOrderDetail);
router.patch('/:orderId/cancel', verifyToken, isCustomer, validate(cancelOrderSchema), cancelOrder);

router.get('/admin/all', verifyToken, isAdmin, validate(getAllOrdersSchema), getAllOrders);
router.get('/admin/:orderId', verifyToken, isAdmin, validate(getOrderByIdSchema), getOrderById);
router.patch('/admin/:orderId/status', verifyToken, isAdmin, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;