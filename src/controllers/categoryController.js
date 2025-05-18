import Category from "../models/category.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";

const getAllCategories = handleAsync(async (req, res) => {
    let query = {};
    
    const categories = await Category.find(query);
    
    res.status(200).json({
        success: true,
        data: categories,
        message: "Lấy danh sách danh mục thành công"
    });
});

const createCategory = handleAsync(async (req, res, next) => {
    const { category_name } = req.body;
    
    if (!category_name) {
        return next(createError(400, "Tên danh mục là bắt buộc"));
    }
    
    const existingCategory = await Category.findOne({ category_name });
    if (existingCategory) {
        return next(createError(400, "Danh mục này đã tồn tại"));
    }
    
    const newCategory = await Category.create({ category_name });
    
    res.status(201).json({
        success: true,
        data: newCategory,
        message: "Tạo danh mục mới thành công"
    });
});

export { getAllCategories, createCategory };
