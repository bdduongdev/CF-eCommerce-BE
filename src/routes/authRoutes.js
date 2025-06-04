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
} from "../controllers/AuthController.js";
import validate from "../middlewares/validate.js";
import {
    loginSchema,
    registerSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../validations/auth.validation.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/register", validate(registerSchema), register);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.get("/reset-password/:resetToken", validateResetToken);
router.post("/reset-password/:resetToken", validate(resetPasswordSchema), resetPassword);

router.use(verifyToken);
router.post("/logout", logout);

export default router;