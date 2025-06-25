import handleAsync from '../utils/handleAsync.js';
import createError from '../utils/createError.js';
import Order from '../models/Order.js';
import OrderDetail from '../models/OrderDetail.js';
import ProductVariant from '../models/ProductVariant.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Coupon from '../models/Coupon.js';
import message from '../constants/index.js';

// Tạo đơn hàng từ giỏ hàng
const createOrderFromCart = handleAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { 
    shipping_address, 
    payment_method, 
    coupon_code, 
    note 
  } = req.body;

  // Kiểm tra giỏ hàng
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    return next(createError(400, message.ORDER.CART_EMPTY));
  }

  const cartItems = await CartItem.find({ cart_id: cart._id })
    .populate({
      path: 'variant_id',
      select: 'price stock_quantity image_url sku',
      populate: [
        { path: 'product_id', select: 'product_name slug' },
        { path: 'color_id', select: 'color_name' },
        { path: 'storage_id', select: 'storage_name' }
      ]
    });

  if (cartItems.length === 0) {
    return next(createError(400, message.ORDER.CART_EMPTY));
  }

  // Kiểm tra tồn kho
  for (const item of cartItems) {
    if (item.variant_id.stock_quantity < item.quantity) {
      return next(createError(400, message.ORDER.OUT_OF_STOCK(item.variant_id.product_id.product_name, item.variant_id.stock_quantity)));
    }
  }

  // Tính toán giá
  let subtotal = cartItems.reduce((total, item) => {
    return total + (item.variant_id.price * item.quantity);
  }, 0);

  let discountAmount = 0;
  let coupon_id = null;

  // Áp dụng coupon nếu có
  if (coupon_code) {
    const coupon = await Coupon.findOne({ 
      code: coupon_code, 
      is_deleted: false,
      expires_at: { $gt: new Date() }
    });

    if (coupon) {
      if (coupon.discount_type === 'percentage') {
        discountAmount = (subtotal * coupon.discount_value) / 100;
      } else {
        discountAmount = coupon.discount_value;
      }
      coupon_id = coupon._id;
    }
  }

  const shippingFee = calculateShippingFee(shipping_address);
  
  const totalAmount = subtotal - discountAmount + shippingFee;

  // Tạo order_number thủ công
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const orderNumber = `ORD${timestamp}${random}`;

  // Tạo đơn hàng
  const order = await Order.create({
    user_id: userId,
    coupon_id,
    order_number: orderNumber,
    shipping_address,
    payment_method,
    subtotal,
    discount_amount: discountAmount,
    shipping_fee: shippingFee,
    total_amount: totalAmount,
    note
  });

  // Tạo chi tiết đơn hàng
  const orderDetails = [];
  for (const item of cartItems) {
    const orderDetail = await OrderDetail.create({
      order_id: order._id,
      product_variant_id: item.variant_id._id,
      product_info: {
        product_name: item.variant_id.product_id.product_name,
        color_name: item.variant_id.color_id.color_name,
        storage_name: item.variant_id.storage_id.storage_name,
        sku: item.variant_id.sku,
        image_url: item.variant_id.image_url
      },
      quantity: item.quantity,
      unit_price: item.variant_id.price,
      total_price: item.quantity * item.variant_id.price
    });
    orderDetails.push(orderDetail);

    // Cập nhật tồn kho
    await ProductVariant.findByIdAndUpdate(
      item.variant_id._id,
      { $inc: { stock_quantity: -item.quantity } }
    );
  }

  // Xóa giỏ hàng sau khi tạo đơn hàng thành công
  await CartItem.deleteMany({ cart_id: cart._id });
  await Cart.findByIdAndDelete(cart._id);

  // Populate thông tin đơn hàng
  const populatedOrder = await Order.findById(order._id)
    .populate('user_id', 'fullname email phone')
    .populate('coupon_id', 'code discount_value discount_type');

  res.status(201).json({
    success: true,
    message: message.ORDER.CREATE_SUCCESS,
    data: {
      order: populatedOrder,
      order_details: orderDetails
    }
  });
});

// Tạo đơn hàng trực tiếp từ sản phẩm
const createOrderDirect = handleAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { 
    variant_id, 
    quantity, 
    shipping_address, 
    payment_method, 
    note 
  } = req.body;

  // Kiểm tra sản phẩm
  const variant = await ProductVariant.findById(variant_id)
    .populate('product_id', 'product_name slug')
    .populate('color_id', 'color_name')
    .populate('storage_id', 'storage_name');

  if (!variant || variant.is_deleted) {
    return next(createError(404, message.ORDER.PRODUCT_NOT_FOUND));
  }

  if (variant.stock_quantity < quantity) {
    return next(createError(400, message.ORDER.OUT_OF_STOCK(variant.product_id.product_name, variant.stock_quantity)));
  }

  // Tính toán giá
  const subtotal = variant.price * quantity;
  const shippingFee = calculateShippingFee(shipping_address);
  const totalAmount = subtotal + shippingFee;

  // Tạo order_number
  const timestamp2 = Date.now().toString();
  const random2 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const orderNumber2 = `ORD${timestamp2}${random2}`;

  const order = await Order.create({
    user_id: userId,
    order_number: orderNumber2,
    shipping_address,
    payment_method,
    subtotal,
    discount_amount: 0,
    shipping_fee: shippingFee,
    total_amount: totalAmount,
    note
  });

  const orderDetail = await OrderDetail.create({
    order_id: order._id,
    product_variant_id: variant._id,
    product_info: {
      product_name: variant.product_id.product_name,
      color_name: variant.color_id.color_name,
      storage_name: variant.storage_id.storage_name,
      sku: variant.sku,
      image_url: variant.image_url
    },
    quantity: quantity,
    unit_price: variant.price,
    total_price: quantity * variant.price
  });

  // Cập nhật tồn kho
  await ProductVariant.findByIdAndUpdate(
    variant._id,
    { $inc: { stock_quantity: -quantity } }
  );

  // Populate thông tin đơn hàng
  const populatedOrder = await Order.findById(order._id)
    .populate('user_id', 'fullname email phone');

  res.status(201).json({
    success: true,
    message: message.ORDER.CREATE_SUCCESS,
    data: {
      order: populatedOrder,
      order_detail: orderDetail
    }
  });
});

const getUserOrders = handleAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status } = req.query;

  const query = { user_id: userId };
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(query)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('coupon_id', 'code discount_value discount_type');

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    message: message.ORDER.GET_LIST_SUCCESS,
    data: {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getOrderDetail = handleAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, user_id: userId })
    .populate('user_id', 'fullname email phone')
    .populate('coupon_id', 'code discount_value discount_type');

  if (!order) {
    return next(createError(404, message.ORDER.NOT_FOUND));
  }

  const orderDetails = await OrderDetail.find({ order_id: orderId })
    .populate('product_variant_id', 'sku');

  res.status(200).json({
    success: true,
    message: message.ORDER.GET_DETAIL_SUCCESS,
    data: {
      order,
      order_details: orderDetails
    }
  });
});

const cancelOrder = handleAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({ _id: orderId, user_id: userId });
  if (!order) {
    return next(createError(404, message.ORDER.NOT_FOUND));
  }

  if (order.status !== 'pending') {
    return next(createError(400, message.ORDER.CANNOT_CANCEL));
  }

  // Cập nhật trạng thái đơn hàng
  order.status = 'cancelled';
  order.cancelled_at = new Date();
  order.cancelled_reason = reason || "Khách hàng hủy";
  await order.save();

  // Hoàn trả tồn kho
  const orderDetails = await OrderDetail.find({ order_id: orderId });
  for (const detail of orderDetails) {
    await ProductVariant.findByIdAndUpdate(
      detail.product_variant_id,
      { $inc: { stock_quantity: detail.quantity } }
    );
  }

  res.status(200).json({
    success: true,
    message: message.ORDER.CANCEL_SUCCESS
  });
});

// Hàm tính phí vận chuyển
const calculateShippingFee = (shipping_address) => {
  // Logic tính phí vận chuyển dựa trên địa chỉ
  const city = shipping_address.city;
  
  // Miễn phí vận chuyển cho một số thành phố
  if (['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'].includes(city)) {
    return 0;
  }
  
  // Phí vận chuyển cố định cho các thành phố khác
  return 30000;
};

export {
  createOrderFromCart,
  createOrderDirect,
  getUserOrders,
  getOrderDetail,
  cancelOrder
}; 