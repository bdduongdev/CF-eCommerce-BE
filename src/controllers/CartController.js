import handleAsync from '../utils/handleAsync.js';
import createError from '../utils/createError.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import ProductVariant from '../models/ProductVariant.js';
import message from '../constants/index.js';

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
            select: 'price stock_quantity image_url sku',
            populate: [
                { path: 'product_id', select: 'product_name slug' },
                { path: 'color_id', select: 'color_name' },
                { path: 'storage_id', select: 'storage_name' }
            ]
        }).lean();

    const totalPrice = cartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
        
    res.status(200).json({
        success: true,
        message: message.CART.GET_SUCCESS,
        data: {
            cart_id: cart._id,
            user_id: cart.user_id,
            items: cartItems,
            total_price: totalPrice,
            total_items: cartItems.reduce((sum, item) => sum + item.quantity, 0)
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

export { addToCart, getCart, removeFromCart, updateCartItemQuantity };
