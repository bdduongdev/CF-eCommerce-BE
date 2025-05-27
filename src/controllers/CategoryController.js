import Category from "../models/Category.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";

// Lấy tất cả danh mục đang hoạt động (không bị xóa mềm)
const getAllCategories = handleAsync(async (req, res, next) => {
    const { limit = 10, page = 1 } = req.query;
    
    const query = { is_deleted: false };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const categories = await Category.find(query)
        .sort({ category_name: 1 })
        .skip(skip)
        .limit(parseInt(limit));
    
    const total = await Category.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            categories,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        message: "Lấy danh sách danh mục thành công"
    });
});

// Lấy danh sách danh mục đã xóa mềm
const getTrashedCategories = handleAsync(async (req, res, next) => {
    const { limit = 10, page = 1 } = req.query;
    
    const query = { is_deleted: true };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const categories = await Category.find(query)
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    
    const total = await Category.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            categories,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        message: "Lấy danh sách danh mục đã xóa mềm thành công"
    });
});

// Lấy danh mục theo ID
const getCategoryById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID danh mục không hợp lệ"));
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
        return next(createError(404, "Không tìm thấy danh mục"));
    }
    
    res.status(200).json({
        success: true,
        data: category,
        message: "Lấy thông tin danh mục thành công"
    });
});

// Tạo danh mục mới
const createCategory = handleAsync(async (req, res, next) => {
    const { category_name } = req.body;
    
    if (!category_name) {
        return next(createError(400, "Tên danh mục là bắt buộc"));
    }
    
    if (category_name.length > 50) {
        return next(createError(400, "Tên danh mục không được vượt quá 50 ký tự"));
    }
    
    // Kiểm tra xem danh mục đã tồn tại chưa
    const existingCategory = await Category.findOne({ 
        category_name: { $regex: new RegExp("^" + category_name + "$", "i") },
        is_deleted: false
    });
    
    if (existingCategory) {
        return next(createError(400, "Danh mục này đã tồn tại"));
    }
    
    const newCategory = await Category.create({
        category_name
    });
    
    res.status(201).json({
        success: true,
        data: newCategory,
        message: "Tạo danh mục mới thành công"
    });
});

// Cập nhật danh mục
const updateCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const { category_name } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID danh mục không hợp lệ"));
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
        return next(createError(404, "Không tìm thấy danh mục"));
    }
    
    if (category.is_deleted) {
        return next(createError(400, "Không thể cập nhật danh mục đã bị xóa"));
    }
    
    if (!category_name) {
        return next(createError(400, "Tên danh mục là bắt buộc"));
    }
    
    if (category_name.length > 50) {
        return next(createError(400, "Tên danh mục không được vượt quá 50 ký tự"));
    }
    
    // Kiểm tra xem tên danh mục mới đã tồn tại chưa (trừ danh mục hiện tại)
    const existingCategory = await Category.findOne({ 
        category_name: { $regex: new RegExp("^" + category_name + "$", "i") },
        _id: { $ne: id },
        is_deleted: false
    });
    
    if (existingCategory) {
        return next(createError(400, "Danh mục này đã tồn tại"));
    }
    
    // Cập nhật danh mục
    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        {
            category_name,
            updated_at: Date.now()
        },
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: updatedCategory,
        message: "Cập nhật danh mục thành công"
    });
});

// Xóa mềm danh mục
const deleteCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID danh mục không hợp lệ"));
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
        return next(createError(404, "Không tìm thấy danh mục"));
    }
    
    if (category.is_deleted) {
        return next(createError(400, "Danh mục này đã bị xóa trước đó"));
    }
    
    // Cập nhật trạng thái xóa mềm
    await Category.findByIdAndUpdate(id, {
        is_deleted: true,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: "Xóa danh mục thành công"
    });
});

// Khôi phục danh mục đã xóa mềm
const restoreCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID danh mục không hợp lệ"));
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
        return next(createError(404, "Không tìm thấy danh mục"));
    }
    
    if (!category.is_deleted) {
        return next(createError(400, "Danh mục này chưa bị xóa"));
    }
    
    // Khôi phục danh mục
    await Category.findByIdAndUpdate(id, {
        is_deleted: false,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: "Khôi phục danh mục thành công"
    });
});

export {
    getAllCategories,
    getTrashedCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory
};