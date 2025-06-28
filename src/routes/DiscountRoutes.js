import express from "express";
import {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getActiveDiscountsForProduct,
  getActiveDiscounts,
  addProductsToDiscount,
  removeProductsFromDiscount
} from "../controllers/DiscountController.js";
import validate from "../middlewares/validate.js";
import {
  createDiscountSchema,
  updateDiscountSchema,
  getDiscountsSchema,
  addProductsToDiscountSchema,
  removeProductsFromDiscountSchema
} from "../validations/discount.validation.js";
import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/", validate(getDiscountsSchema, 'query'), getAllDiscounts);
router.get("/active", getActiveDiscounts);
router.get("/product/:product_id", getActiveDiscountsForProduct);
router.get("/:id", getDiscountById);

// Protected routes (require authentication)
router.use(verifyToken);

// Admin routes (require admin role)
router.post("/", isAdmin, validate(createDiscountSchema), createDiscount);
router.put("/:id", isAdmin, validate(updateDiscountSchema), updateDiscount);
router.delete("/:id", isAdmin, deleteDiscount);

// Product management routes
router.post("/:id/products", isAdmin, validate(addProductsToDiscountSchema), addProductsToDiscount);
router.delete("/:id/products", isAdmin, validate(removeProductsFromDiscountSchema), removeProductsFromDiscount);

export default router;
