import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
    login,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    logout
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:resetToken", validateResetToken);
router.post("/reset-password/:resetToken", resetPassword);

router.use(verifyToken);
router.post("/logout", logout);

export default router;