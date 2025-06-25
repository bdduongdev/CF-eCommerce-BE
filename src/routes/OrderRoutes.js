import express from 'express';
import { verifyToken, isCustomer } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  createOrderFromCart,
  createOrderDirect,
  getUserOrders,
  getOrderDetail,
  cancelOrder
} from '../controllers/OrderController.js';
import {
  createOrderFromCartSchema,
  createOrderDirectSchema,
  cancelOrderSchema
} from '../validations/order.validation.js';

const router = express.Router();

router.use(verifyToken, isCustomer);

router.post('/from-cart', validate(createOrderFromCartSchema), createOrderFromCart);
router.post('/direct', validate(createOrderDirectSchema), createOrderDirect);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderDetail);
router.patch('/:orderId/cancel', validate(cancelOrderSchema), cancelOrder);

export default router; 