import ProductColor from "../models/ProductColor.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";

const getAllColors = handleAsync(async (req, res, next) => {
    const colors = await ProductColor.find({ is_deleted: false }).sort({ color_name: 1 });
    
    res.status(200).json({
        success: true,
        data: colors,
        message: message.PRODUCT_COLOR.GET_ALL_SUCCESS
    });
});

const getTrashedColors = handleAsync(async (req, res, next) => {
    const colors = await ProductColor.find({ is_deleted: true }).sort({ updated_at: -1 });
    
    res.status(200).json({
        success: true,
        data: colors,
        message: message.PRODUCT_COLOR.GET_TRASHED_SUCCESS
    });
});

const getColorById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.PRODUCT_COLOR.INVALID_ID));
    }
    
    const color = await ProductColor.findById(id);
    
    if (!color) {
        return next(createError(404, message.PRODUCT_COLOR.NOT_FOUND));
    }
    
    res.status(200).json({
        success: true,
        data: color,
        message: message.PRODUCT_COLOR.GET_BY_ID_SUCCESS
    });
});

const createColor = handleAsync(async (req, res, next) => {
    const { color_name, price } = req.body;
    
    if (!color_name || price === undefined) {
        return next(createError(400, message.PRODUCT_COLOR.NAME_PRICE_REQUIRED));
    }
    
    if (color_name.length > 100) {
        return next(createError(400, message.PRODUCT_COLOR.NAME_TOO_LONG));
    }
    
    if (isNaN(price) || price < 0) {
        return next(createError(400, message.PRODUCT_COLOR.PRICE_INVALID));
    }
    
    const newColor = await ProductColor.create({
        color_name,
        price
    });
    
    res.status(201).json({
        success: true,
        data: newColor,
        message: message.PRODUCT_COLOR.CREATE_SUCCESS
    });
});

const updateColor = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.PRODUCT_COLOR.INVALID_ID));
    }
    
    const color = await ProductColor.findById(id);
    
    if (!color) {
        return next(createError(404, message.PRODUCT_COLOR.NOT_FOUND));
    }
    
    if (updateData.color_name && updateData.color_name.length > 100) {
        return next(createError(400, message.PRODUCT_COLOR.NAME_TOO_LONG));
    }
    
    if (updateData.price !== undefined && (isNaN(updateData.price) || updateData.price < 0)) {
        return next(createError(400, message.PRODUCT_COLOR.PRICE_INVALID));
    }
    
    updateData.updated_at = Date.now();
    
    const updatedColor = await ProductColor.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: updatedColor,
        message: message.PRODUCT_COLOR.UPDATE_SUCCESS
    });
});

const deleteColor = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.PRODUCT_COLOR.INVALID_ID));
    }
    
    const color = await ProductColor.findById(id);
    
    if (!color) {
        return next(createError(404, message.PRODUCT_COLOR.NOT_FOUND));
    }
    
    await ProductColor.findByIdAndUpdate(id, {
        is_deleted: true,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: message.PRODUCT_COLOR.DELETE_SUCCESS
    });
});

const restoreColor = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, message.PRODUCT_COLOR.INVALID_ID));
    }
    
    const color = await ProductColor.findById(id);
    
    if (!color) {
        return next(createError(404, message.PRODUCT_COLOR.NOT_FOUND));
    }
    
    if (!color.is_deleted) {
        return next(createError(400, message.PRODUCT_COLOR.NOT_DELETED));
    }
    
    await ProductColor.findByIdAndUpdate(id, {
        is_deleted: false,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: message.PRODUCT_COLOR.RESTORE_SUCCESS
    });
});

export {
    getAllColors,
    getColorById,
    createColor,
    updateColor,
    deleteColor,
    getTrashedColors,
    restoreColor
};