import { Router } from "express";
import { getAllCategories, createCategory } from "../controllers/categoryController.js";
import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = Router();

// Routes công khai - ai cũng có thể truy cập
router.get("/", getAllCategories);

// Routes yêu cầu xác thực và phân quyền
router.post("/create", verifyToken, isAdmin, createCategory);

export default router;