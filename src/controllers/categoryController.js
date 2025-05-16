import Category from "../models/category.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";

// Lấy tất cả danh mục
const getAllCategories = handleAsync(async (req, res) => {
    const { includeDeleted } = req.query;
    let query = {};
    
    const categories = await Category.find(query);
    
    res.status(200).json({
        success: true,
        data: categories,
        message: "Lấy danh sách danh mục thành công"
    });
});

export { getAllCategories };
