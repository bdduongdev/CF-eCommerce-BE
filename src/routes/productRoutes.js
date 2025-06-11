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
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/show/:id", getProductById);

router.use(verifyToken);

router.get("/trashed", isAdmin, getTrashedProducts);
router.post("/create", isAdmin, upload.single('image'), validate(createProductSchema), createProduct);
router.put("/update/:id", isAdmin, upload.single('image'), validate(updateProductSchema), updateProduct);
router.patch("/status/:id", isAdmin, validate(updateProductStatusSchema), updateProductStatus);
router.delete("/delete/:id", isAdmin, deleteProduct);
router.put("/restore/:id", isAdmin, restoreProduct);

export default router;