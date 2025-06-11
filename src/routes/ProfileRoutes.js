import express from "express";
import { verifyToken, isAdmin, isCustomer, isAdminOrCustomer } from "../middlewares/auth.js";
import { 
    getProfile,
    updateProfile,
    updatePassword,
    updateAvatar
} from "../controllers/ProfileController.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.get("/", verifyToken, isAdminOrCustomer, getProfile);

router.put("/", verifyToken, isAdminOrCustomer, updateProfile);

router.put("/password", verifyToken, isAdminOrCustomer, updatePassword);

router.put("/avatar", verifyToken, isAdminOrCustomer, updateAvatar);

export default router; 