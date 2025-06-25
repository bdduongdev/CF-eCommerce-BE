import express from 'express';
import { verifyToken, isCustomer } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  processPayment,
  getPaymentHistory,
  processRefund
} from '../controllers/PaymentController.js';
import {
  processPaymentSchema,
  processRefundSchema
} from '../validations/order.validation.js';

const router = express.Router();

router.use(verifyToken, isCustomer);

router.post('/:orderId/process', validate(processPaymentSchema), processPayment);
router.get('/:orderId/history', getPaymentHistory);
router.post('/:orderId/refund', validate(processRefundSchema), processRefund);

export default router; 