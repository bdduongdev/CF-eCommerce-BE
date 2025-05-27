import ProductStorage from "../models/ProductStorage.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";

// Lấy tất cả dung lượng
const getAllStorages = handleAsync(async (req, res, next) => {
    const storages = await ProductStorage.find({ is_deleted: false }).sort({ storage_name: 1 });
    
    res.status(200).json({
        success: true,
        data: storages,
        message: "Lấy danh sách dung lượng thành công"
    });
});

// Lấy danh sách dung lượng đã xóa mềm
const getTrashedStorages = handleAsync(async (req, res, next) => {
    const storages = await ProductStorage.find({ is_deleted: true }).sort({ updated_at: -1 });
    
    res.status(200).json({
        success: true,
        data: storages,
        message: "Lấy danh sách dung lượng đã xóa mềm thành công"
    });
});

// Lấy dung lượng theo ID
const getStorageById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID dung lượng không hợp lệ"));
    }
    
    const storage = await ProductStorage.findById(id);
    
    if (!storage) {
        return next(createError(404, "Không tìm thấy dung lượng"));
    }
    
    res.status(200).json({
        success: true,
        data: storage,
        message: "Lấy thông tin dung lượng thành công"
    });
});

// Tạo dung lượng mới
const createStorage = handleAsync(async (req, res, next) => {
    const { storage_name, price } = req.body;
    
    if (!storage_name || price === undefined) {
        return next(createError(400, "Tên và giá dung lượng là bắt buộc"));
    }
    
    if (storage_name.length > 100) {
        return next(createError(400, "Tên dung lượng không được vượt quá 100 ký tự"));
    }
    
    if (isNaN(price) || price < 0) {
        return next(createError(400, "Giá phải là số không âm"));
    }
    
    const newStorage = await ProductStorage.create({
        storage_name,
        price
    });
    
    res.status(201).json({
        success: true,
        data: newStorage,
        message: "Tạo dung lượng mới thành công"
    });
});

// Cập nhật dung lượng
const updateStorage = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID dung lượng không hợp lệ"));
    }
    
    const storage = await ProductStorage.findById(id);
    
    if (!storage) {
        return next(createError(404, "Không tìm thấy dung lượng"));
    }
    
    // Validate dữ liệu cập nhật
    if (updateData.storage_name && updateData.storage_name.length > 100) {
        return next(createError(400, "Tên dung lượng không được vượt quá 100 ký tự"));
    }
    
    if (updateData.price !== undefined && (isNaN(updateData.price) || updateData.price < 0)) {
        return next(createError(400, "Giá phải là số không âm"));
    }
    
    // Cập nhật thời gian cập nhật
    updateData.updated_at = Date.now();
    
    const updatedStorage = await ProductStorage.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: updatedStorage,
        message: "Cập nhật dung lượng thành công"
    });
});

// Xóa mềm dung lượng
const deleteStorage = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID dung lượng không hợp lệ"));
    }
    
    const storage = await ProductStorage.findById(id);
    
    if (!storage) {
        return next(createError(404, "Không tìm thấy dung lượng"));
    }
    
    // Cập nhật trạng thái xóa mềm
    await ProductStorage.findByIdAndUpdate(id, {
        is_deleted: true,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: "Xóa dung lượng thành công"
    });
});

// Khôi phục dung lượng đã xóa mềm
const restoreStorage = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID dung lượng không hợp lệ"));
    }
    
    const storage = await ProductStorage.findById(id);
    
    if (!storage) {
        return next(createError(404, "Không tìm thấy dung lượng"));
    }
    
    if (!storage.is_deleted) {
        return next(createError(400, "Dung lượng này chưa bị xóa"));
    }
    
    // Khôi phục dung lượng
    await ProductStorage.findByIdAndUpdate(id, {
        is_deleted: false,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: "Khôi phục dung lượng thành công"
    });
});

export {
    getAllStorages,
    getStorageById,
    createStorage,
    updateStorage,
    deleteStorage,
    getTrashedStorages,
    restoreStorage
};