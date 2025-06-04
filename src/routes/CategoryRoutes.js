import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import {
    getAllCategories,
    getTrashedCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory
} from "../controllers/CategoryController.js";
import validate from "../middlewares/validate.js";
import {
    createCategorySchema,
    updateCategorySchema
} from "../validations/category.validation.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/detail/:id", getCategoryById);

router.use(verifyToken);
router.use(isAdmin);

router.get("/trashed", getTrashedCategories);
router.post("/create", validate(createCategorySchema), createCategory);
router.put("/update/:id", validate(updateCategorySchema), updateCategory);
router.delete("/delete/:id", deleteCategory);
router.put("/restore/:id", restoreCategory);

export default router;