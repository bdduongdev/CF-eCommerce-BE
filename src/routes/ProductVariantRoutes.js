import express from "express";
import { verifyToken, isAdmin, isCustomer, isAdminOrCustomer } from "../middlewares/auth.js";
import { createProductVariant, updateProductVariant, deleteProductVariant, getAllProductVariants } from "../controllers/ProductVariantController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllProductVariants);

router.use(verifyToken, isAdmin);

router.post("/create", upload.single('image'), createProductVariant);
router.put("/update/:id", upload.single('image'), updateProductVariant);
router.delete("/delete/:id", deleteProductVariant);

export default router; 