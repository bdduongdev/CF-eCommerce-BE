import Category from "../models/Category.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";

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
        message: message.CATEGORY.GET_ALL_SUCCESS
    });
});

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
        message: message.CATEGORY.GET_TRASHED_SUCCESS
    });
});

const getCategoryById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.CATEGORY.INVALID_ID));
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
        return next(createError(404, message.CATEGORY.NOT_FOUND));
    }
    
    res.status(200).json({
        success: true,
        data: category,
        message: message.CATEGORY.GET_BY_ID_SUCCESS
    });
});

const createCategory = handleAsync(async (req, res, next) => {
    const { category_name } = req.body;
    
    // Validation is now handled by the middleware
    
    const existingCategory = await Category.findOne({ 
        category_name: { $regex: new RegExp("^" + category_name + "$", "i") },
        is_deleted: false
    });
    
    if (existingCategory) {
        return next(createError(400, message.CATEGORY.ALREADY_EXISTS));
    }
    
    const newCategory = await Category.create({
        category_name
    });
    
    res.status(201).json({
        success: true,
        data: newCategory,
        message: message.CATEGORY.CREATE_SUCCESS
    });
});

const updateCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const { category_name } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.CATEGORY.INVALID_ID));
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
        return next(createError(404, message.CATEGORY.NOT_FOUND));
    }
    
    if (category.is_deleted) {
        return next(createError(400, message.CATEGORY.CANNOT_UPDATE_DELETED));
    }
    
    // Validation is now handled by the middleware
    
    const existingCategory = await Category.findOne({ 
        category_name: { $regex: new RegExp("^" + category_name + "$", "i") },
        _id: { $ne: id },
        is_deleted: false
    });
    
    if (existingCategory) {
        return next(createError(400, message.CATEGORY.ALREADY_EXISTS));
    }
    
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
        message: message.CATEGORY.UPDATE_SUCCESS
    });
});

const deleteCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.CATEGORY.INVALID_ID));
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
        return next(createError(404, message.CATEGORY.NOT_FOUND));
    }
    
    if (category.is_deleted) {
        return next(createError(400, message.CATEGORY.ALREADY_DELETED));
    }
    
    await Category.findByIdAndUpdate(id, {
        is_deleted: true,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: message.CATEGORY.DELETE_SUCCESS
    });
});

const restoreCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.CATEGORY.INVALID_ID));
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
        return next(createError(404, message.CATEGORY.NOT_FOUND));
    }
    
    if (!category.is_deleted) {
        return next(createError(400, message.CATEGORY.NOT_DELETED));
    }
    
    await Category.findByIdAndUpdate(id, {
        is_deleted: false,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: message.CATEGORY.RESTORE_SUCCESS
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