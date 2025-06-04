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
} from "../controllers/ProductColorController.js";
import validate from "../middlewares/validate.js";
import {
    createColorSchema,
    updateColorSchema
} from "../validations/productColor.validation.js";

const router = express.Router();

router.get("/", getAllColors);

router.use(verifyToken);
router.use(isAdmin);

router.get("/trashed", getTrashedColors);
router.put("/restore/:id", restoreColor);

router.get("/:id", getColorById);
router.post("/", validate(createColorSchema), createColor);
router.put("/:id", validate(updateColorSchema), updateColor);
router.delete("/:id", deleteColor);

export default router;