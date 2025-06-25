import handleAsync from '../utils/handleAsync.js';
import createError from '../utils/createError.js';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import message from '../constants/index.js';

// Xử lý thanh toán đơn hàng
const processPayment = handleAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { payment_method, payment_details } = req.body;
  const userId = req.user.id;

  // Kiểm tra đơn hàng
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) {
    return next(createError(404, message.PAYMENT.ORDER_NOT_FOUND));
  }

  if (order.payment_status === 'paid') {
    return next(createError(400, message.PAYMENT.ALREADY_PAID));
  }

  if (order.status === 'cancelled') {
    return next(createError(400, message.PAYMENT.CANNOT_PAY_CANCELLED));
  }

  try {
    // Xử lý thanh toán theo phương thức
    let paymentResult = null;
    
    switch (payment_method) {
      case 'cod':
        paymentResult = await processCODPayment(order, payment_details);
        break;
      case 'bank_transfer':
        paymentResult = await processBankTransferPayment(order, payment_details);
        break;
      case 'credit_card':
        paymentResult = await processCreditCardPayment(order, payment_details);
        break;
      case 'momo':
        paymentResult = await processMoMoPayment(order, payment_details);
        break;
      case 'vnpay':
        paymentResult = await processVNPayPayment(order, payment_details);
        break;
      default:
        return next(createError(400, message.PAYMENT.INVALID_METHOD));
    }

    if (paymentResult.success) {
      // Cập nhật trạng thái đơn hàng
      order.payment_status = 'paid';
      order.status = 'confirmed';
      await order.save();

      // Tạo record thanh toán
      await Payment.create({
        order_id: order._id,
        amount: order.total_amount,
        payment_method: payment_method,
        payment_date: new Date()
      });

      res.status(200).json({
        success: true,
        message: message.PAYMENT.SUCCESS,
        data: {
          order_id: order._id,
          order_number: order.order_number,
          payment_method: payment_method,
          amount: order.total_amount,
          payment_details: paymentResult.details
        }
      });
    } else {
      // Cập nhật trạng thái thanh toán thất bại
      order.payment_status = 'failed';
      await order.save();

      return next(createError(400, paymentResult.message || message.PAYMENT.FAILED));
    }

  } catch (error) {
    console.error('Lỗi thanh toán:', error);
    
    // Cập nhật trạng thái thanh toán thất bại
    order.payment_status = 'failed';
    await order.save();

    return next(createError(500, message.PAYMENT.ERROR));
  }
});

// Xử lý thanh toán COD (Cash on Delivery)
const processCODPayment = async (order, payment_details) => {
  // COD không cần xử lý gì đặc biệt, chỉ cần xác nhận
  return {
    success: true,
    details: {
      method: 'cod',
      status: 'pending',
      message: 'Thanh toán khi nhận hàng'
    }
  };
};

// Xử lý thanh toán chuyển khoản ngân hàng
const processBankTransferPayment = async (order, payment_details) => {
  // Mô phỏng xử lý chuyển khoản
  // Trong thực tế sẽ tích hợp với API ngân hàng
  
  const { bank_name, account_number, transaction_id } = payment_details;
  
  if (!bank_name || !account_number || !transaction_id) {
    return {
      success: false,
      message: message.PAYMENT.BANK_INFO_REQUIRED
    };
  }

  // Mô phỏng kiểm tra giao dịch
  const isValidTransaction = await validateBankTransaction(transaction_id);
  
  if (!isValidTransaction) {
    return {
      success: false,
      message: message.PAYMENT.BANK_TRANSACTION_INVALID
    };
  }

  return {
    success: true,
    details: {
      method: 'bank_transfer',
      bank_name: bank_name,
      account_number: account_number,
      transaction_id: transaction_id,
      status: 'completed'
    }
  };
};

// Xử lý thanh toán thẻ tín dụng
const processCreditCardPayment = async (order, payment_details) => {
  // Mô phỏng xử lý thẻ tín dụng
  // Trong thực tế sẽ tích hợp với cổng thanh toán
  
  const { card_number, expiry_date, cvv, cardholder_name } = payment_details;
  
  if (!card_number || !expiry_date || !cvv || !cardholder_name) {
    return {
      success: false,
      message: message.PAYMENT.CARD_INFO_REQUIRED
    };
  }

  // Mô phỏng xác thực thẻ
  const isCardValid = await validateCreditCard(card_number, expiry_date, cvv);
  
  if (!isCardValid) {
    return {
      success: false,
      message: message.PAYMENT.CARD_INVALID
    };
  }

  // Mô phỏng xử lý giao dịch
  const transactionId = generateTransactionId();
  
  return {
    success: true,
    details: {
      method: 'credit_card',
      transaction_id: transactionId,
      card_last4: card_number.slice(-4),
      status: 'completed'
    }
  };
};

// Xử lý thanh toán MoMo
const processMoMoPayment = async (order, payment_details) => {
  // Mô phỏng tích hợp MoMo
  // Trong thực tế sẽ gọi API MoMo
  
  const { phone_number, otp } = payment_details;
  
  if (!phone_number || !otp) {
    return {
      success: false,
      message: message.PAYMENT.MOMO_INFO_REQUIRED
    };
  }

  // Mô phỏng xác thực OTP
  const isOTPValid = await validateMoMoOTP(phone_number, otp);
  
  if (!isOTPValid) {
    return {
      success: false,
      message: message.PAYMENT.MOMO_OTP_INVALID
    };
  }

  const transactionId = generateTransactionId();
  
  return {
    success: true,
    details: {
      method: 'momo',
      phone_number: phone_number,
      transaction_id: transactionId,
      status: 'completed'
    }
  };
};

// Xử lý thanh toán VNPay
const processVNPayPayment = async (order, payment_details) => {
  // Mô phỏng tích hợp VNPay
  // Trong thực tế sẽ tạo URL thanh toán VNPay
  
  const { return_url } = payment_details;
  
  // Tạo URL thanh toán VNPay
  const vnpayUrl = await createVNPayPaymentUrl(order, return_url);
  
  return {
    success: true,
    details: {
      method: 'vnpay',
      payment_url: vnpayUrl,
      status: 'pending'
    }
  };
};

// Lấy lịch sử thanh toán của đơn hàng
const getPaymentHistory = handleAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  // Kiểm tra đơn hàng thuộc về user
  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) {
    return next(createError(404, message.PAYMENT.ORDER_NOT_FOUND));
  }

  const payments = await Payment.find({ order_id: orderId })
    .sort({ payment_date: -1 });

  res.status(200).json({
    success: true,
    message: message.PAYMENT.HISTORY_SUCCESS,
    data: {
      order_id: orderId,
      order_number: order.order_number,
      payments: payments
    }
  });
});

// Hoàn tiền
const processRefund = handleAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { reason, amount } = req.body;
  const userId = req.user.id;

  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) {
    return next(createError(404, message.PAYMENT.ORDER_NOT_FOUND));
  }

  if (order.payment_status !== 'paid') {
    return next(createError(400, message.PAYMENT.REFUND_ONLY_PAID));
  }

  if (order.status === 'delivered') {
    return next(createError(400, message.PAYMENT.REFUND_DELIVERED));
  }

  const refundAmount = amount || order.total_amount;

  try {
    // Xử lý hoàn tiền theo phương thức thanh toán
    const refundResult = await processRefundByMethod(order, refundAmount);

    if (refundResult.success) {
      // Cập nhật trạng thái đơn hàng
      order.payment_status = 'refunded';
      order.status = 'cancelled';
      order.cancelled_reason = reason || "Hoàn tiền";
      order.cancelled_at = new Date();
      await order.save();

      // Tạo record hoàn tiền
      await Payment.create({
        order_id: order._id,
        amount: -refundAmount, // Số âm để phân biệt với thanh toán
        payment_method: order.payment_method,
        payment_date: new Date()
      });

      res.status(200).json({
        success: true,
        message: message.PAYMENT.REFUND_SUCCESS,
        data: {
          order_id: order._id,
          refund_amount: refundAmount,
          refund_details: refundResult.details
        }
      });
    } else {
      return next(createError(400, refundResult.message || message.PAYMENT.REFUND_FAILED));
    }

  } catch (error) {
    console.error('Lỗi hoàn tiền:', error);
    return next(createError(500, message.PAYMENT.ERROR));
  }
});

// Các hàm helper (mô phỏng)
const validateBankTransaction = async (transactionId) => {
  // Mô phỏng kiểm tra giao dịch ngân hàng
  return Math.random() > 0.1; // 90% thành công
};

const validateCreditCard = async (cardNumber, expiryDate, cvv) => {
  // Mô phỏng xác thực thẻ
  return cardNumber.length === 16 && cvv.length === 3;
};

const validateMoMoOTP = async (phoneNumber, otp) => {
  // Mô phỏng xác thực OTP MoMo
  return otp === '123456'; // OTP mặc định cho test
};

const createVNPayPaymentUrl = async (order, returnUrl) => {
  // Mô phỏng tạo URL thanh toán VNPay
  return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${order.total_amount}&vnp_Command=pay&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+${order.order_number}&vnp_OrderType=other&vnp_ReturnUrl=${returnUrl}&vnp_TmnCode=DEMOVNPAY&vnp_TxnRef=${order.order_number}&vnp_Version=2.1.0`;
};

const processRefundByMethod = async (order, amount) => {
  // Mô phỏng xử lý hoàn tiền theo phương thức
  return {
    success: true,
    details: {
      method: order.payment_method,
      refund_amount: amount,
      status: 'completed'
    }
  };
};

const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export {
  processPayment,
  getPaymentHistory,
  processRefund
}; 