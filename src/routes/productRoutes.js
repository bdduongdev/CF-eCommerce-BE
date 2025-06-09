import express from "express";
import { verifyToken, isAdmin, isCustomer, isAdminOrCustomer } from "../middlewares/auth.js";
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getTrashedProducts,
    restoreProduct,
    searchProducts,
    updateProductStatus
} from "../controllers/ProductController.js";
import validate from "../middlewares/validate.js";
import { createProductSchema, updateProductSchema, updateProductStatusSchema } from "../validations/product.validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/show/:id", getProductById);

// Protected routes
router.use(verifyToken);

// Admin only routes
router.get("/trashed", isAdmin, getTrashedProducts);
router.post("/create", isAdmin, validate(createProductSchema), createProduct);
router.put("/update/:id", isAdmin, validate(updateProductSchema), updateProduct);
router.patch("/status/:id", isAdmin, validate(updateProductStatusSchema), updateProductStatus);
router.delete("/delete/:id", isAdmin, deleteProduct);
router.put("/restore/:id", isAdmin, restoreProduct);

export default router;