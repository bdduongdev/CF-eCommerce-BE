import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import {
    getAllColors,
    getColorById,
    createColor,
    updateColor,
    deleteColor
} from "../controllers/productColorController.js";

const router = express.Router();

// Route công khai
router.get("/", getAllColors);
router.get("/:id", getColorById);

// Route yêu cầu quyền admin
router.use(verifyToken);
router.use(isAdmin);

router.post("/", createColor);
router.put("/:id", updateColor);
router.delete("/:id", deleteColor);

export default router;