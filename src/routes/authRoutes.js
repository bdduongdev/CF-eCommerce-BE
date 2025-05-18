import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

// Route đăng nhập
router.post("/login", login);

export default router;