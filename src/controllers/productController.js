import Product from "../models/Product.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";

const getAllProducts = handleAsync(async (req, res, next) => {
    const { category, search, minPrice, maxPrice, sort, limit = 10, page = 1 } = req.query;
    
    const query = {};
    
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
        .populate('color_id', 'color_name')
        .populate('storage_id', 'storage_name');
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            products,
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
        .populate('color_id', 'color_name')
        .populate('storage_id', 'storage_name');
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            products,
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
        .populate('color_id', 'color_name')
        .populate('storage_id', 'storage_name');
    
    if (!product) {
        return next(createError(404, message.PRODUCT.NOT_FOUND));
    }
    
    res.status(200).json({
        success: true,
        data: product,
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
        image_url 
    } = req.body;
    
    try {
        const newProduct = await Product.create({
            product_name,
            description: description || "",
            price,
            stock_quantity: stock_quantity || 0,
            category_id,
            color_id,
            storage_id,
            image_url: image_url || ""
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
    
    // Validation for fields is now handled by Joi middleware
    
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

export {
    getAllProducts,
    getTrashedProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct
};