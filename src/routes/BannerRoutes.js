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
  toggleBannerStatus,
} from "../controllers/BannerController.js";
import validate from "../middlewares/validate.js";
import {
  createBannerSchema,
  updateBannerSchema,
  toggleStatusSchema,
} from "../validations/banner.validation.js";
import uploadBanner from "../middlewares/uploadBanner.js";

const router = express.Router();

router.get("/", getAllBanners);
router.get("/:id", getBannerById);

router.use(verifyToken, isAdmin);

router.post("/", uploadBanner.single('image'), validate(createBannerSchema), createBanner);
router.put("/:id", uploadBanner.single('image'), validate(updateBannerSchema), updateBanner);
router.delete("/:id", deleteBanner);
router.patch("/:id/restore", restoreBanner);
router.patch("/:id/toggle-status", validate(toggleStatusSchema), toggleBannerStatus);
router.get("/trashed/all", getTrashedBanners);

export default router;
