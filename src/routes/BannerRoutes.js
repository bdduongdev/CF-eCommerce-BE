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

const router = express.Router();

router.get("/", getAllBanners);
router.get("/detail/:id", getBannerById);

router.use(verifyToken);
router.use(isAdmin);

router.get("/trashed", getTrashedBanners);
router.post("/create", createBanner);
router.put("/update/:id", updateBanner);
router.delete("/delete/:id", deleteBanner);
router.put("/restore/:id", restoreBanner);
router.put("/toggle-status/:id", toggleBannerStatus);

export default router;