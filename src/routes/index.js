import express from "express";
import AuthRoutes from "./AuthRoutes.js";
import ProductRoutes from "./ProductRoutes.js";
import ProductColorRoutes from "./ProductColorRoutes.js";
import ProductStorageRoutes from "./ProductStorageRoutes.js";
import BannerRoutes from "./BannerRoutes.js";
import CategoryRoutes from "./CategoryRoutes.js";

const router = express.Router();

router.use("/auth", AuthRoutes);
router.use("/products", ProductRoutes);
router.use("/colors", ProductColorRoutes);
router.use("/storages", ProductStorageRoutes);
router.use("/banners", BannerRoutes);
router.use("/categories", CategoryRoutes);

export default router;