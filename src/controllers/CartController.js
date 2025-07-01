import handleAsync from '../utils/handleAsync.js';
import createError from '../utils/createError.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import ProductVariant from '../models/ProductVariant.js';
import message from '../constants/index.js';
import DiscountProduct from '../models/DiscountProduct.js';
import Discount from '../models/Discount.js';

// Add product to cart
const addToCart = handleAsync(async (req, res, next) => {
    const { variantId, quantity } = req.body;
    const userId = req.user.id;

    const variant = await ProductVariant.findById(variantId);
    if (!variant || variant.is_deleted) {
        return next(createError(404, message.PRODUCT.NOT_FOUND));
    }

    if (variant.stock_quantity < quantity) {
        return next(createError(400, message.CART.OUT_OF_STOCK));
    }

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
        cart = await Cart.create({ user_id: userId });
    }

    let cartItem = await CartItem.findOne({ cart_id: cart._id, variant_id: variantId });

    if (cartItem) {
        const newQuantity = cartItem.quantity + quantity;
        if (variant.stock_quantity < newQuantity) {
            return next(createError(400, `Số lượng tồn kho không đủ. Chỉ còn ${variant.stock_quantity} sản phẩm.`));
        }
        cartItem.quantity = newQuantity;
    } else {
        cartItem = new CartItem({
            cart_id: cart._id,
            variant_id: variantId,
            quantity: quantity,
            price: variant.price 
        });
    }

    await cartItem.save();

    const updatedCartItems = await CartItem.find({ cart_id: cart._id })
        .populate({
            path: 'variant_id',
            select: 'price stock_quantity image_url sku',
            populate: [
                { path: 'product_id', select: 'product_name slug' },
                { path: 'color_id', select: 'color_name' },
                { path: 'storage_id', select: 'storage_name' }
            ]
        });

    const totalPrice = updatedCartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    res.status(200).json({
        success: true,
        message: message.CART.ADD_SUCCESS,
        data: {
            cart_id: cart._id,
            user_id: cart.user_id,
            items: updatedCartItems,
            total_price: totalPrice,
            total_items: updatedCartItems.reduce((sum, item) => sum + item.quantity, 0)
        }
    });
});

const getCart = handleAsync(async (req, res, next) => {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
        return res.status(200).json({
            success: true,
            message: message.CART.GET_SUCCESS,
            data: {
                items: [],
                total_price: 0,
                total_items: 0
            }
        });
    }

    const cartItems = await CartItem.find({ cart_id: cart._id })
        .populate({
            path: 'variant_id',
            select: 'price stock_quantity image_url sku product_id',
            populate: [
                { path: 'product_id', select: 'product_name slug' },
                { path: 'color_id', select: 'color_name' },
                { path: 'storage_id', select: 'storage_name' }
            ]
        }).lean();

    // Lấy discount cho từng sản phẩm trong giỏ hàng
    const now = new Date();
    const itemsWithDiscount = await Promise.all(cartItems.map(async (item) => {
        const productId = item.variant_id && item.variant_id.product_id
            ? item.variant_id.product_id._id || item.variant_id.product_id
            : null;
        let discount = null;
        if (productId) {
            // Tìm discount-product
            const discountProduct = await DiscountProduct.findOne({ product_id: productId });
            if (discountProduct) {
                // Tìm discount còn hiệu lực
                discount = await Discount.findOne({
                    _id: discountProduct.discount_id,
                    is_active: true,
                    start_date: { $lte: now },
                    end_date: { $gte: now }
                }).lean();
            }
        }
        return {
            ...item,
            discount: discount ? {
                _id: discount._id,
                discount_type: discount.discount_type,
                discount_value: discount.discount_value,
                description: discount.description
            } : null
        };
    }));

    const totalPrice = itemsWithDiscount.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
        
    res.status(200).json({
        success: true,
        message: message.CART.GET_SUCCESS,
        data: {
            cart_id: cart._id,
            user_id: cart.user_id,
            items: itemsWithDiscount,
            total_price: totalPrice,
            total_items: itemsWithDiscount.reduce((sum, item) => sum + item.quantity, 0)
        }
    });
});

const removeFromCart = handleAsync(async (req, res, next) => {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    const cartItem = await CartItem.findById(cartItemId);
    if(!cartItem) {
        return next(createError(404, message.CART.PRODUCT_NOT_FOUND));
    }
    
    const cart = await Cart.findOne({ _id: cartItem.cart_id, user_id: userId });
    if (!cart) {
        return next(createError(403, "Bạn không có quyền xóa sản phẩm này."));
    }

    await CartItem.findByIdAndDelete(cartItemId);

    res.status(200).json({
        success: true,
        message: message.CART.DELETE_SUCCESS
    });
});

const updateCartItemQuantity = handleAsync(async (req, res, next) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
        return next(createError(400, message.CART.INVALID_QUANTITY));
    }

    const cartItem = await CartItem.findById(cartItemId).populate('variant_id');
     if(!cartItem) {
        return next(createError(404, message.CART.PRODUCT_NOT_FOUND));
    }

    const cart = await Cart.findOne({ _id: cartItem.cart_id, user_id: userId });
    if (!cart) {
        return next(createError(403, "Bạn không có quyền cập nhật sản phẩm này."));
    }
    
    if (cartItem.variant_id.stock_quantity < quantity) {
        return next(createError(400, message.CART.OUT_OF_STOCK));
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
        success: true,
        message: message.CART.UPDATE_SUCCESS,
        data: cartItem
    });
});

// Thanh toán nhanh các sản phẩm đã chọn trong giỏ hàng
const checkoutSelectedCartItems = handleAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { cartItemIds, shipping_address, payment_method, coupon_code, note } = req.body;

    if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
        return next(createError(400, 'Vui lòng chọn sản phẩm để thanh toán.'));
    }

    // Lấy các cart item đã chọn
    const cartItems = await CartItem.find({ _id: { $in: cartItemIds }, cart_id: (await Cart.findOne({ user_id: userId }))._id })
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
        return next(createError(400, 'Không tìm thấy sản phẩm hợp lệ trong giỏ hàng.'));
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
        const Coupon = (await import('../models/Coupon.js')).default;
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

    // Tính phí vận chuyển (giả lập)
    const shippingFee = 0;
    const totalAmount = subtotal - discountAmount + shippingFee;

    // Tạo order_number thủ công
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Tạo đơn hàng
    const Order = (await import('../models/Order.js')).default;
    const OrderDetail = (await import('../models/OrderDetail.js')).default;
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

    // Xóa các cart item đã thanh toán
    await CartItem.deleteMany({ _id: { $in: cartItemIds } });

    // Populate thông tin đơn hàng
    const populatedOrder = await Order.findById(order._id)
        .populate('user_id', 'fullname email phone')
        .populate('coupon_id', 'code discount_value discount_type');

    res.status(201).json({
        success: true,
        message: 'Thanh toán thành công',
        data: {
            order: populatedOrder,
            order_details: orderDetails
        }
    });
});

export { addToCart, getCart, removeFromCart, updateCartItemQuantity, checkoutSelectedCartItems };
