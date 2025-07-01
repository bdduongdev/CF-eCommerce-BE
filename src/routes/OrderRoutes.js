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

router.use(isCustomer);

router.post('/', validate(createOrderSchema), createOrder);
router.post('/from-cart', validate(createOrderFromCartSchema), createOrderFromCart);
router.post('/direct', validate(createOrderDirectSchema), createOrderDirect);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderDetail);
router.patch('/:orderId/cancel', validate(cancelOrderSchema), cancelOrder);

router.use('/admin', isAdmin);

router.get('/all', validate(getAllOrdersSchema), getAllOrders);
router.get('/:orderId', validate(getOrderByIdSchema), getOrderById);
router.patch('/:orderId/status', validate(updateOrderStatusSchema), updateOrderStatus);

export default router;