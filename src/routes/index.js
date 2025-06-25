import express from "express";
import AuthRoutes from "./AuthRoutes.js";
import ProductRoutes from "./ProductRoutes.js";
import ProductColorRoutes from "./ProductColorRoutes.js";
import ProductStorageRoutes from "./ProductStorageRoutes.js";
import BannerRoutes from "./BannerRoutes.js";
import CategoryRoutes from "./CategoryRoutes.js";
import ReviewRoutes from "./ReviewRoutes.js";
import WishlistRoutes from "./WishlistRoutes.js";
import ProfileRoutes from "./ProfileRoutes.js";
import UserRoutes from "./UserRoutes.js";
import CartRoutes from "./CartRoutes.js";
import OrderRoutes from "./OrderRoutes.js";
import PaymentRoutes from "./PaymentRoutes.js";

const router = express.Router();

router.use("/auth", AuthRoutes);
router.use("/products", ProductRoutes);
router.use("/colors", ProductColorRoutes);
router.use("/storages", ProductStorageRoutes);
router.use("/banners", BannerRoutes);
router.use("/categories", CategoryRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/wishlist", WishlistRoutes);
router.use("/profile", ProfileRoutes);
router.use("/users", UserRoutes);
router.use("/cart", CartRoutes);
router.use("/orders", OrderRoutes);
router.use("/payments", PaymentRoutes);

export default router;