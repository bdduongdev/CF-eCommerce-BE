import express from "express";
import categoryRoutes from "./categoryRoutes.js";
import authRoutes from "./authRoutes.js";
// Import các routes khác nếu có

const router = express.Router();

router.use("/categories", categoryRoutes);
router.use("/auth", authRoutes);
// Đăng ký các routes khác nếu có

export default router;