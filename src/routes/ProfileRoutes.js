import express from "express";
import { verifyToken, isAdminOrCustomer } from "../middlewares/auth.js";
import {
  getProfile,
  updateProfile,
  updatePassword,
  updateAvatar,
} from "../controllers/ProfileController.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.use(verifyToken, isAdminOrCustomer);

router.get("/", getProfile);

router.put("/", updateProfile);

router.put("/password", updatePassword);

router.put("/avatar", updateAvatar);

export default router; 