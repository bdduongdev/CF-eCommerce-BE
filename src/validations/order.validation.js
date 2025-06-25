import Joi from 'joi';

// Validation cho địa chỉ giao hàng
const shippingAddressSchema = Joi.object({
  fullname: Joi.string().required().trim().min(2).max(100).messages({
    'string.empty': 'Họ tên không được để trống',
    'string.min': 'Họ tên phải có ít nhất 2 ký tự',
    'string.max': 'Họ tên không được vượt quá 100 ký tự'
  }),
  phone: Joi.string().required().pattern(/^0[0-9]{9}$/).messages({
    'string.empty': 'Số điện thoại không được để trống',
    'string.pattern.base': 'Số điện thoại không hợp lệ'
  }),
  street: Joi.string().required().trim().min(5).max(200).messages({
    'string.empty': 'Địa chỉ không được để trống',
    'string.min': 'Địa chỉ phải có ít nhất 5 ký tự',
    'string.max': 'Địa chỉ không được vượt quá 200 ký tự'
  }),
  ward: Joi.string().required().trim().messages({
    'string.empty': 'Phường/xã không được để trống'
  }),
  district: Joi.string().required().trim().messages({
    'string.empty': 'Quận/huyện không được để trống'
  }),
  city: Joi.string().required().trim().messages({
    'string.empty': 'Tỉnh/thành phố không được để trống'
  }),
  country: Joi.string().default('Việt Nam').trim()
});

// Validation cho tạo đơn hàng từ giỏ hàng
export const createOrderFromCartSchema = Joi.object({
  shipping_address: shippingAddressSchema.required(),
  payment_method: Joi.string().valid('cod', 'bank_transfer', 'credit_card', 'momo', 'vnpay').required().messages({
    'any.only': 'Phương thức thanh toán không hợp lệ'
  }),
  coupon_code: Joi.string().optional().trim(),
  note: Joi.string().optional().trim().max(500).messages({
    'string.max': 'Ghi chú không được vượt quá 500 ký tự'
  })
});

// Validation cho tạo đơn hàng trực tiếp
export const createOrderDirectSchema = Joi.object({
  variant_id: Joi.string().required().messages({
    'string.empty': 'ID biến thể sản phẩm không được để trống'
  }),
  quantity: Joi.number().integer().min(1).max(10).required().messages({
    'number.base': 'Số lượng phải là số',
    'number.integer': 'Số lượng phải là số nguyên',
    'number.min': 'Số lượng phải ít nhất là 1',
    'number.max': 'Số lượng không được vượt quá 10'
  }),
  shipping_address: shippingAddressSchema.required(),
  payment_method: Joi.string().valid('cod', 'bank_transfer', 'credit_card', 'momo', 'vnpay').required().messages({
    'any.only': 'Phương thức thanh toán không hợp lệ'
  }),
  note: Joi.string().optional().trim().max(500).messages({
    'string.max': 'Ghi chú không được vượt quá 500 ký tự'
  })
});

// Validation cho hủy đơn hàng
export const cancelOrderSchema = Joi.object({
  reason: Joi.string().optional().trim().max(200).messages({
    'string.max': 'Lý do hủy không được vượt quá 200 ký tự'
  })
});

// Validation cho thanh toán
export const processPaymentSchema = Joi.object({
  payment_method: Joi.string().valid('cod', 'bank_transfer', 'credit_card', 'momo', 'vnpay').required().messages({
    'any.only': 'Phương thức thanh toán không hợp lệ'
  }),
  payment_details: Joi.object({
    // Cho bank transfer
    bank_name: Joi.when('payment_method', {
      is: 'bank_transfer',
      then: Joi.string().required().messages({
        'string.empty': 'Tên ngân hàng không được để trống'
      }),
      otherwise: Joi.optional()
    }),
    account_number: Joi.when('payment_method', {
      is: 'bank_transfer',
      then: Joi.string().required().messages({
        'string.empty': 'Số tài khoản không được để trống'
      }),
      otherwise: Joi.optional()
    }),
    transaction_id: Joi.when('payment_method', {
      is: 'bank_transfer',
      then: Joi.string().required().messages({
        'string.empty': 'Mã giao dịch không được để trống'
      }),
      otherwise: Joi.optional()
    }),
    
    // Cho credit card
    card_number: Joi.when('payment_method', {
      is: 'credit_card',
      then: Joi.string().pattern(/^[0-9]{16}$/).required().messages({
        'string.empty': 'Số thẻ không được để trống',
        'string.pattern.base': 'Số thẻ phải có 16 chữ số'
      }),
      otherwise: Joi.optional()
    }),
    expiry_date: Joi.when('payment_method', {
      is: 'credit_card',
      then: Joi.string().pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).required().messages({
        'string.empty': 'Ngày hết hạn không được để trống',
        'string.pattern.base': 'Ngày hết hạn phải có định dạng MM/YY'
      }),
      otherwise: Joi.optional()
    }),
    cvv: Joi.when('payment_method', {
      is: 'credit_card',
      then: Joi.string().pattern(/^[0-9]{3,4}$/).required().messages({
        'string.empty': 'CVV không được để trống',
        'string.pattern.base': 'CVV phải có 3-4 chữ số'
      }),
      otherwise: Joi.optional()
    }),
    cardholder_name: Joi.when('payment_method', {
      is: 'credit_card',
      then: Joi.string().required().trim().messages({
        'string.empty': 'Tên chủ thẻ không được để trống'
      }),
      otherwise: Joi.optional()
    }),
    
    // Cho MoMo
    phone_number: Joi.when('payment_method', {
      is: 'momo',
      then: Joi.string().pattern(/^0[0-9]{9}$/).required().messages({
        'string.empty': 'Số điện thoại không được để trống',
        'string.pattern.base': 'Số điện thoại không hợp lệ'
      }),
      otherwise: Joi.optional()
    }),
    otp: Joi.when('payment_method', {
      is: 'momo',
      then: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
        'string.empty': 'Mã OTP không được để trống',
        'string.pattern.base': 'Mã OTP phải có 6 chữ số'
      }),
      otherwise: Joi.optional()
    }),
    
    // Cho VNPay
    return_url: Joi.when('payment_method', {
      is: 'vnpay',
      then: Joi.string().uri().required().messages({
        'string.empty': 'URL trả về không được để trống',
        'string.uri': 'URL trả về không hợp lệ'
      }),
      otherwise: Joi.optional()
    })
  }).required()
});

// Validation cho hoàn tiền
export const processRefundSchema = Joi.object({
  reason: Joi.string().required().trim().min(5).max(200).messages({
    'string.empty': 'Lý do hoàn tiền không được để trống',
    'string.min': 'Lý do hoàn tiền phải có ít nhất 5 ký tự',
    'string.max': 'Lý do hoàn tiền không được vượt quá 200 ký tự'
  }),
  amount: Joi.number().positive().optional().messages({
    'number.base': 'Số tiền hoàn phải là số',
    'number.positive': 'Số tiền hoàn phải lớn hơn 0'
  })
}); 