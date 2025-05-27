import ProductColor from "../models/ProductColor.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";

// Lấy tất cả màu sắc
const getAllColors = handleAsync(async (req, res, next) => {
    const colors = await ProductColor.find().sort({ color_name: 1 });
    
    res.status(200).json({
        success: true,
        data: colors,
        message: "Lấy danh sách màu sắc thành công"
    });
});

// Lấy màu sắc theo ID
const getColorById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID màu sắc không hợp lệ"));
    }
    
    const color = await ProductColor.findById(id);
    
    if (!color) {
        return next(createError(404, "Không tìm thấy màu sắc"));
    }
    
    res.status(200).json({
        success: true,
        data: color,
        message: "Lấy thông tin màu sắc thành công"
    });
});

// Tạo màu sắc mới
const createColor = handleAsync(async (req, res, next) => {
    const { color_name, price } = req.body;
    
    if (!color_name || price === undefined) {
        return next(createError(400, "Tên và giá màu sắc là bắt buộc"));
    }
    
    if (color_name.length > 100) {
        return next(createError(400, "Tên màu sắc không được vượt quá 100 ký tự"));
    }
    
    if (isNaN(price) || price < 0) {
        return next(createError(400, "Giá phải là số không âm"));
    }
    
    const newColor = await ProductColor.create({
        color_name,
        price
    });
    
    res.status(201).json({
        success: true,
        data: newColor,
        message: "Tạo màu sắc mới thành công"
    });
});

// Cập nhật màu sắc
const updateColor = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID màu sắc không hợp lệ"));
    }
    
    const color = await ProductColor.findById(id);
    
    if (!color) {
        return next(createError(404, "Không tìm thấy màu sắc"));
    }
    
    // Validate dữ liệu cập nhật
    if (updateData.color_name && updateData.color_name.length > 100) {
        return next(createError(400, "Tên màu sắc không được vượt quá 100 ký tự"));
    }
    
    if (updateData.price !== undefined && (isNaN(updateData.price) || updateData.price < 0)) {
        return next(createError(400, "Giá phải là số không âm"));
    }
    
    // Cập nhật thời gian cập nhật
    updateData.updated_at = Date.now();
    
    const updatedColor = await ProductColor.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: updatedColor,
        message: "Cập nhật màu sắc thành công"
    });
});

// Xóa màu sắc
const deleteColor = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID màu sắc không hợp lệ"));
    }
    
    const color = await ProductColor.findById(id);
    
    if (!color) {
        return next(createError(404, "Không tìm thấy màu sắc"));
    }
    
    await ProductColor.findByIdAndDelete(id);
    
    res.status(200).json({
        success: true,
        message: "Xóa màu sắc thành công"
    });
});

export {
    getAllColors,
    getColorById,
    createColor,
    updateColor,
    deleteColor
};