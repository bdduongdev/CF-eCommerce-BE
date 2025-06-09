import Product from "../models/Product.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";

const getAllProducts = handleAsync(async (req, res, next) => {
    const { category, search, minPrice, maxPrice, sort, limit = 10, page = 1, status } = req.query;
    
    const query = { is_deleted: false };
    
    if (category) {
        query.category_id = category;
    }
    
    if (search) {
        query.product_name = { $regex: search, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (status) {
        query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let sortOptions = {};
    if (sort) {
        const [field, order] = sort.split(':');
        sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
        sortOptions = { created_at: -1 };
    }
    
    const products = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category_id', 'category_name')
        .populate('color_id', 'color_name price')
        .populate('storage_id', 'storage_name price');
    
    // Calculate total price including variants
    const productsWithTotalPrice = products.map(product => {
        const productObj = product.toObject();
        const basePrice = productObj.price || 0;
        const colorPrice = productObj.color_id?.price || 0;
        const storagePrice = productObj.storage_id?.price || 0;
        productObj.total_price = basePrice + colorPrice + storagePrice;
        return productObj;
    });
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            products: productsWithTotalPrice,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        message: message.PRODUCT.GET_ALL_SUCCESS
    });
});

const getTrashedProducts = handleAsync(async (req, res, next) => {
    const { limit = 10, page = 1 } = req.query;
    
    const query = { is_deleted: true };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category_id', 'category_name')
        .populate('color_id', 'color_name price')
        .populate('storage_id', 'storage_name price');
    
    // Calculate total price including variants
    const productsWithTotalPrice = products.map(product => {
        const productObj = product.toObject();
        const basePrice = productObj.price || 0;
        const colorPrice = productObj.color_id?.price || 0;
        const storagePrice = productObj.storage_id?.price || 0;
        productObj.total_price = basePrice + colorPrice + storagePrice;
        return productObj;
    });
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            products: productsWithTotalPrice,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        message: message.PRODUCT.GET_TRASHED_SUCCESS
    });
});

const getProductById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const product = await Product.findById(id)
        .populate('category_id', 'category_name')
        .populate('color_id', 'color_name price')
        .populate('storage_id', 'storage_name price');
    
    if (!product) {
        return next(createError(404, message.PRODUCT.NOT_FOUND));
    }
    
    // Calculate total price including variants
    const productObj = product.toObject();
    const basePrice = productObj.price || 0;
    const colorPrice = productObj.color_id?.price || 0;
    const storagePrice = productObj.storage_id?.price || 0;
    productObj.total_price = basePrice + colorPrice + storagePrice;
    
    res.status(200).json({
        success: true,
        data: productObj,
        message: message.PRODUCT.GET_BY_ID_SUCCESS
    });
});

const createProduct = handleAsync(async (req, res, next) => {
    // Validation is now handled by Joi middleware
    const { 
        product_name, 
        description, 
        price, 
        stock_quantity, 
        category_id, 
        color_id, 
        storage_id, 
        image_url,
        status 
    } = req.body;
    
    try {
        // Tự động set status thành out_of_stock nếu stock_quantity = 0
        let productStatus = status;
        if (stock_quantity === 0 && !status) {
            productStatus = 'out_of_stock';
        }
        
        const newProduct = await Product.create({
            product_name,
            description: description || "",
            price,
            stock_quantity: stock_quantity || 0,
            category_id,
            color_id,
            storage_id,
            image_url: image_url || "",
            status: productStatus || "active"
        });
        
        res.status(201).json({
            success: true,
            data: newProduct,
            message: message.PRODUCT.CREATE_SUCCESS
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(createError(400, messages.join(', ')));
        }
        return next(error);
    }
});

const updateProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.PRODUCT.INVALID_ID));
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
        return next(createError(404, message.PRODUCT.NOT_FOUND));
    }
    
    // Tự động cập nhật status thành out_of_stock nếu stock_quantity = 0
    if (updateData.stock_quantity === 0 && !updateData.status) {
        updateData.status = 'out_of_stock';
    }
    
    // Cập nhật thời gian cập nhật
    updateData.updated_at = Date.now();
    
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: updatedProduct,
        message: message.PRODUCT.UPDATE_SUCCESS
    });
});

const deleteProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.PRODUCT.INVALID_ID));
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
        return next(createError(404, message.PRODUCT.NOT_FOUND));
    }
    
    if (product.is_deleted) {
        return next(createError(400, message.PRODUCT.ALREADY_DELETED));
    }
    
    // Cập nhật trạng thái xóa mềm
    await Product.findByIdAndUpdate(id, {
        is_deleted: true,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: message.PRODUCT.DELETE_SUCCESS
    });
});

const restoreProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.PRODUCT.INVALID_ID));
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
        return next(createError(404, message.PRODUCT.NOT_FOUND));
    }
    
    if (!product.is_deleted) {
        return next(createError(400, message.PRODUCT.NOT_DELETED));
    }
    
    // Khôi phục sản phẩm
    await Product.findByIdAndUpdate(id, {
        is_deleted: false,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: message.PRODUCT.RESTORE_SUCCESS
    });
});

const searchProducts = handleAsync(async (req, res, next) => {
    const { q, limit = 10, page = 1, status } = req.query;
    
    if (!q) {
        return next(createError(400, "Từ khóa tìm kiếm là bắt buộc"));
    }
    
    const query = {
        product_name: { $regex: q, $options: 'i' },
        is_deleted: false
    };
    
    if (status) {
        query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category_id', 'category_name')
        .populate('color_id', 'color_name price')
        .populate('storage_id', 'storage_name price');
    
    // Calculate total price including variants
    const productsWithTotalPrice = products.map(product => {
        const productObj = product.toObject();
        const basePrice = productObj.price || 0;
        const colorPrice = productObj.color_id?.price || 0;
        const storagePrice = productObj.storage_id?.price || 0;
        productObj.total_price = basePrice + colorPrice + storagePrice;
        return productObj;
    });
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            products: productsWithTotalPrice,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        message: "Tìm kiếm sản phẩm thành công"
    });
});

// Thêm hàm updateProductStatus
const updateProductStatus = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.PRODUCT.INVALID_ID));
    }
    
    const validStatuses = ['active', 'inactive', 'out_of_stock', 'discontinued'];
    if (!validStatuses.includes(status)) {
        return next(createError(400, "Trạng thái không hợp lệ"));
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
        return next(createError(404, message.PRODUCT.NOT_FOUND));
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { status, updated_at: Date.now() },
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: updatedProduct,
        message: "Cập nhật trạng thái sản phẩm thành công"
    });
});

export {
    getAllProducts,
    getTrashedProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    searchProducts,
    updateProductStatus
};