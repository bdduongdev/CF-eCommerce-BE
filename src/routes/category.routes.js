import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";

const router = Router();

// Routes không cần xác thực
router.get("/", categoryController.getAllCategories);

export default router;