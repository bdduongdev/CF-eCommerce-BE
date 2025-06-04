import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import {
    getAllBanners,
    getTrashedBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    restoreBanner,
    toggleBannerStatus
} from "../controllers/BannerController.js";
import validate from "../middlewares/validate.js";
import {
    createBannerSchema,
    updateBannerSchema,
    toggleStatusSchema
} from "../validations/banner.validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllBanners);
router.get("/:id", getBannerById);

// Protected routes
router.use(verifyToken);
router.use(isAdmin);

router.post("/", validate(createBannerSchema), createBanner);
router.put("/:id", validate(updateBannerSchema), updateBanner);
router.delete("/:id", deleteBanner);
router.patch("/:id/restore", restoreBanner);
router.patch("/:id/toggle-status", validate(toggleStatusSchema), toggleBannerStatus);
router.get("/trashed/all", getTrashedBanners);

export default router;