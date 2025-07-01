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

router.get("/", validate(getDiscountsSchema, 'query'), getAllDiscounts);
router.get("/active", getActiveDiscounts);
router.get("/product/:product_id", getActiveDiscountsForProduct);
router.get("/:id", getDiscountById);

router.use(verifyToken);

router.post("/create", isAdmin, validate(createDiscountSchema), createDiscount);
router.put("/update/:id", isAdmin, validate(updateDiscountSchema), updateDiscount);
router.delete("/delete/:id", isAdmin, deleteDiscount);

router.post("/:id/products", isAdmin, validate(addProductsToDiscountSchema), addProductsToDiscount);
router.delete("/:id/products", isAdmin, validate(removeProductsFromDiscountSchema), removeProductsFromDiscount);

export default router;
