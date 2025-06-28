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

// Validation cho admin lấy danh sách đơn hàng
export const getAllOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Số trang phải là số',
    'number.integer': 'Số trang phải là số nguyên',
    'number.min': 'Số trang phải lớn hơn 0'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Giới hạn phải là số',
    'number.integer': 'Giới hạn phải là số nguyên',
    'number.min': 'Giới hạn phải lớn hơn 0',
    'number.max': 'Giới hạn không được vượt quá 100'
  }),
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned').optional().messages({
    'any.only': 'Trạng thái đơn hàng không hợp lệ'
  }),
  payment_status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional().messages({
    'any.only': 'Trạng thái thanh toán không hợp lệ'
  }),
  payment_method: Joi.string().valid('cod', 'bank_transfer', 'credit_card', 'momo', 'vnpay').optional().messages({
    'any.only': 'Phương thức thanh toán không hợp lệ'
  }),
  search: Joi.string().optional().trim().max(100).messages({
    'string.max': 'Từ khóa tìm kiếm không được vượt quá 100 ký tự'
  }),
  start_date: Joi.date().iso().optional().messages({
    'date.base': 'Ngày bắt đầu không hợp lệ',
    'date.format': 'Ngày bắt đầu phải có định dạng ISO'
  }),
  end_date: Joi.date().iso().optional().messages({
    'date.base': 'Ngày kết thúc không hợp lệ',
    'date.format': 'Ngày kết thúc phải có định dạng ISO'
  }),
  sort_by: Joi.string().valid('created_at', 'order_number', 'total_amount', 'status').optional().messages({
    'any.only': 'Trường sắp xếp không hợp lệ'
  }),
  sort_order: Joi.string().valid('asc', 'desc').optional().messages({
    'any.only': 'Thứ tự sắp xếp không hợp lệ'
  })
});

// Validation cho admin lấy chi tiết đơn hàng
export const getOrderByIdSchema = Joi.object({
  orderId: Joi.string().required().messages({
    'string.empty': 'ID đơn hàng không được để trống'
  })
});

// Validation cho admin cập nhật trạng thái đơn hàng
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned').required().messages({
    'any.only': 'Trạng thái đơn hàng không hợp lệ',
    'string.empty': 'Trạng thái đơn hàng không được để trống'
  }),
  note: Joi.string().optional().trim().max(500).messages({
    'string.max': 'Ghi chú không được vượt quá 500 ký tự'
  }),
  tracking_number: Joi.string().optional().trim().max(100).messages({
    'string.max': 'Mã vận chuyển không được vượt quá 100 ký tự'
  }),
  estimated_delivery: Joi.date().optional().messages({
    'date.base': 'Ngày dự kiến giao hàng không hợp lệ'
  }),
  cancelled_reason: Joi.when('status', {
    is: 'cancelled',
    then: Joi.string().required().trim().max(200).messages({
      'string.empty': 'Lý do hủy đơn hàng không được để trống',
      'string.max': 'Lý do hủy không được vượt quá 200 ký tự'
    }),
    otherwise: Joi.optional()
  })
}); 