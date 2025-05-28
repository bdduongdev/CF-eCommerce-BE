import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import {
    getAllColors,
    getColorById,
    createColor,
    updateColor,
    deleteColor,
    getTrashedColors,
    restoreColor
} from "../controllers/productColorController.js";

const router = express.Router();

router.get("/", getAllColors);

router.use(verifyToken);
router.use(isAdmin);

router.get("/trashed", getTrashedColors);
router.put("/restore/:id", restoreColor);

router.get("/:id", getColorById);
router.post("/", createColor);
router.put("/:id", updateColor);
router.delete("/:id", deleteColor);

export default router;