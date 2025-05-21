import express from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);

export default router;