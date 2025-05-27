import Product from "../models/Product.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";

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
        message: "Lấy danh sách sản phẩm thành công"
    });
});

const getTrashedProducts = handleAsync(async (req, res, next) => {
    const { limit = 10, page = 1 } = req.query;
    
    const query = { is_deleted: true }; // Chỉ lấy sản phẩm đã bị xóa mềm
    
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
        message: "Lấy danh sách sản phẩm đã xóa mềm thành công"
    });
});

const getProductById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const product = await Product.findById(id)
        .populate('category_id', 'category_name')
        .populate('color_id', 'color_name')
        .populate('storage_id', 'storage_name');
    
    if (!product) {
        return next(createError(404, "Không tìm thấy sản phẩm"));
    }
    
    res.status(200).json({
        success: true,
        data: product,
        message: "Lấy thông tin sản phẩm thành công"
    });
});

const createProduct = handleAsync(async (req, res, next) => {
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
    
    if (!product_name) {
        return next(createError(400, "Tên sản phẩm là bắt buộc"));
    }
    
    if (product_name.length > 100) {
        return next(createError(400, "Tên sản phẩm không được vượt quá 100 ký tự"));
    }
    
    if (!price) {
        return next(createError(400, "Giá sản phẩm là bắt buộc"));
    }
    
    if (isNaN(price) || price < 0) {
        return next(createError(400, "Giá sản phẩm phải là số dương"));
    }
    
    if (stock_quantity !== undefined) {
        if (isNaN(stock_quantity) || stock_quantity < 0) {
            return next(createError(400, "Số lượng tồn kho phải là số dương"));
        }
    }
    
    if (category_id) {
        if (!mongoose.Types.ObjectId.isValid(category_id)) {
            return next(createError(400, "ID danh mục không hợp lệ"));
        }
    }
    
    if (color_id) {
        if (!mongoose.Types.ObjectId.isValid(color_id)) {
            return next(createError(400, "ID màu sắc không hợp lệ"));
        }
    }
    
    if (storage_id) {
        if (!mongoose.Types.ObjectId.isValid(storage_id)) {
            return next(createError(400, "ID bộ nhớ không hợp lệ"));
        }
    }
    
    if (image_url && image_url.length > 255) {
        return next(createError(400, "URL hình ảnh không được vượt quá 255 ký tự"));
    }
    
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
            message: "Tạo sản phẩm mới thành công"
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
        return next(createError(400, "ID sản phẩm không hợp lệ"));
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
        return next(createError(404, "Không tìm thấy sản phẩm"));
    }
    
    if (updateData.product_name && updateData.product_name.length > 100) {
        return next(createError(400, "Tên sản phẩm không được vượt quá 100 ký tự"));
    }
    
    if (updateData.price !== undefined) {
        if (isNaN(updateData.price) || updateData.price < 0) {
            return next(createError(400, "Giá sản phẩm phải là số dương"));
        }
    }
    
    if (updateData.stock_quantity !== undefined) {
        if (isNaN(updateData.stock_quantity) || updateData.stock_quantity < 0) {
            return next(createError(400, "Số lượng tồn kho phải là số không âm"));
        }
    }
    
    if (updateData.category_id) {
        if (!mongoose.Types.ObjectId.isValid(updateData.category_id)) {
            return next(createError(400, "ID danh mục không hợp lệ"));
        }
    }
    
    if (updateData.color_id) {
        if (!mongoose.Types.ObjectId.isValid(updateData.color_id)) {
            return next(createError(400, "ID màu sắc không hợp lệ"));
        }
    }
    
    if (updateData.storage_id) {
        if (!mongoose.Types.ObjectId.isValid(updateData.storage_id)) {
            return next(createError(400, "ID bộ nhớ không hợp lệ"));
        }
    }
    
    if (updateData.image_url && updateData.image_url.length > 255) {
        return next(createError(400, "URL hình ảnh không được vượt quá 255 ký tự"));
    }
    
    updateData.updated_at = Date.now();
    
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            data: updatedProduct,
            message: "Cập nhật sản phẩm thành công"
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(createError(400, messages.join(', ')));
        }
        return next(error);
    }
});

const deleteProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID sản phẩm không hợp lệ"));
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
        return next(createError(404, "Không tìm thấy sản phẩm"));
    }
    
    await Product.findByIdAndUpdate(id, { is_deleted: true, updated_at: Date.now() });
    
    res.status(200).json({
        success: true,
        message: "Xóa mềm sản phẩm thành công"
    });
});

const restoreProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID sản phẩm không hợp lệ"));
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
        return next(createError(404, "Không tìm thấy sản phẩm"));
    }
    
    if (!product.is_deleted) {
        return next(createError(400, "Sản phẩm chưa bị xóa mềm"));
    }
    
    await Product.findByIdAndUpdate(id, { is_deleted: false, updated_at: Date.now() });
    
    res.status(200).json({
        success: true,
        message: "Khôi phục sản phẩm thành công"
    });
});

export {
    getAllProducts,
    getProductById,
    getTrashedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct
};