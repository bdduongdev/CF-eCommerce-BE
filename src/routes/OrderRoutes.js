import express from 'express';
import { verifyToken, isCustomer, isAdmin } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  createOrder,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  createOrderDirect,
  createOrderFromCart
} from '../controllers/OrderController.js';
import {
  createOrderSchema,
  createOrderDirectSchema,
  cancelOrderSchema,
  getAllOrdersSchema,
  getOrderByIdSchema,
  updateOrderStatusSchema,
  createOrderFromCartSchema
} from '../validations/order.validation.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', isCustomer, validate(createOrderSchema), createOrder);
router.post('/from-cart', isCustomer, validate(createOrderFromCartSchema), createOrderFromCart);
router.post('/direct', isCustomer, validate(createOrderDirectSchema), createOrderDirect);
router.get('/', isCustomer, getUserOrders);
router.get('/:orderId', isCustomer, getOrderDetail);
router.patch('/:orderId/cancel', isCustomer, validate(cancelOrderSchema), cancelOrder);

router.get('/admin/all', isAdmin, validate(getAllOrdersSchema), getAllOrders);
router.get('/admin/:orderId', isAdmin, validate(getOrderByIdSchema), getOrderById);
router.patch('/admin/:orderId/status', isAdmin, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;