import Banner from "../models/Banner.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";

// Lấy tất cả banner đang hoạt động (không bị xóa mềm)
const getAllBanners = handleAsync(async (req, res, next) => {
    const { limit = 10, page = 1, is_active } = req.query;
    
    const query = { is_deleted: false };
    
    if (is_active !== undefined) {
        query.is_active = is_active === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const banners = await Banner.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    
    const total = await Banner.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            banners,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        message: "Lấy danh sách banner thành công"
    });
});

// Lấy danh sách banner đã xóa mềm
const getTrashedBanners = handleAsync(async (req, res, next) => {
    const { limit = 10, page = 1 } = req.query;
    
    const query = { is_deleted: true };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const banners = await Banner.find(query)
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    
    const total = await Banner.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            banners,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        message: "Lấy danh sách banner đã xóa mềm thành công"
    });
});

// Lấy banner theo ID
const getBannerById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID banner không hợp lệ"));
    }
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
        return next(createError(404, "Không tìm thấy banner"));
    }
    
    res.status(200).json({
        success: true,
        data: banner,
        message: "Lấy thông tin banner thành công"
    });
});

// Tạo banner mới
const createBanner = handleAsync(async (req, res, next) => {
    const { 
        title, 
        image_url, 
        link_url, 
        position, 
        is_active, 
        start_date, 
        end_date 
    } = req.body;
    
    if (!image_url) {
        return next(createError(400, "URL hình ảnh là bắt buộc"));
    }
    
    if (title && title.length > 100) {
        return next(createError(400, "Tiêu đề không được vượt quá 100 ký tự"));
    }
    
    if (image_url && image_url.length > 255) {
        return next(createError(400, "URL hình ảnh không được vượt quá 255 ký tự"));
    }
    
    if (link_url && link_url.length > 255) {
        return next(createError(400, "URL liên kết không được vượt quá 255 ký tự"));
    }
    
    if (position && position.length > 50) {
        return next(createError(400, "Vị trí không được vượt quá 50 ký tự"));
    }
    
    const newBanner = await Banner.create({
        title,
        image_url,
        link_url,
        position,
        is_active: is_active !== undefined ? is_active : true,
        start_date,
        end_date
    });
    
    res.status(201).json({
        success: true,
        data: newBanner,
        message: "Tạo banner mới thành công"
    });
});

// Cập nhật banner
const updateBanner = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID banner không hợp lệ"));
    }
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
        return next(createError(404, "Không tìm thấy banner"));
    }
    
    if (banner.is_deleted) {
        return next(createError(400, "Không thể cập nhật banner đã bị xóa"));
    }
    
    // Validate dữ liệu cập nhật
    if (updateData.title && updateData.title.length > 100) {
        return next(createError(400, "Tiêu đề không được vượt quá 100 ký tự"));
    }
    
    if (updateData.image_url && updateData.image_url.length > 255) {
        return next(createError(400, "URL hình ảnh không được vượt quá 255 ký tự"));
    }
    
    if (updateData.link_url && updateData.link_url.length > 255) {
        return next(createError(400, "URL liên kết không được vượt quá 255 ký tự"));
    }
    
    if (updateData.position && updateData.position.length > 50) {
        return next(createError(400, "Vị trí không được vượt quá 50 ký tự"));
    }
    
    // Cập nhật thời gian cập nhật
    updateData.updated_at = Date.now();
    
    const updatedBanner = await Banner.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: updatedBanner,
        message: "Cập nhật banner thành công"
    });
});

// Xóa mềm banner
const deleteBanner = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID banner không hợp lệ"));
    }
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
        return next(createError(404, "Không tìm thấy banner"));
    }
    
    if (banner.is_deleted) {
        return next(createError(400, "Banner này đã bị xóa trước đó"));
    }
    
    // Cập nhật trạng thái xóa mềm
    await Banner.findByIdAndUpdate(id, {
        is_deleted: true,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: "Xóa banner thành công"
    });
});

// Khôi phục banner đã xóa mềm
const restoreBanner = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID banner không hợp lệ"));
    }
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
        return next(createError(404, "Không tìm thấy banner"));
    }
    
    if (!banner.is_deleted) {
        return next(createError(400, "Banner này chưa bị xóa"));
    }
    
    // Khôi phục banner
    await Banner.findByIdAndUpdate(id, {
        is_deleted: false,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: "Khôi phục banner thành công"
    });
});

// Thay đổi trạng thái hoạt động của banner
const toggleBannerStatus = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, "ID banner không hợp lệ"));
    }
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
        return next(createError(404, "Không tìm thấy banner"));
    }
    
    if (banner.is_deleted) {
        return next(createError(400, "Không thể thay đổi trạng thái của banner đã bị xóa"));
    }
    
    // Đảo ngược trạng thái hoạt động
    await Banner.findByIdAndUpdate(id, {
        is_active: !banner.is_active,
        updated_at: Date.now()
    });
    
    res.status(200).json({
        success: true,
        message: `Banner đã được ${!banner.is_active ? 'kích hoạt' : 'vô hiệu hóa'} thành công`
    });
});

export {
    getAllBanners,
    getTrashedBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    restoreBanner,
    toggleBannerStatus
};