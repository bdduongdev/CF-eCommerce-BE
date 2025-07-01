import express from "express";
import { verifyToken, isAdmin, isCustomer, isAdminOrCustomer } from "../middlewares/auth.js";
import { 
    getAllProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getTrashedProducts,
    restoreProduct,
    searchProducts,
    updateProductStatus,
    getProductById,
    getGroupedProductBySlug,
    uploadProductImages,
    updateProductMainImage,
    deleteProductImage
} from "../controllers/ProductController.js";
import validate from "../middlewares/validate.js";
import { createProductSchema, updateProductSchema, updateProductStatusSchema, deleteProductImageSchema } from "../validations/product.validation.js";
import upload from "../middlewares/upload.js";
import path from "path";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/group/:slug", getGroupedProductBySlug);
router.get("/show/:id", getProductById);

router.use(verifyToken, isAdmin);

router.get("/trashed", getTrashedProducts);
router.post("/create", validate(createProductSchema), createProduct);
router.put("/update/:id", validate(updateProductSchema), updateProduct);
router.patch("/status/:id", validate(updateProductStatusSchema), updateProductStatus);
router.delete("/delete/:id", deleteProduct);
router.put("/restore/:id", restoreProduct);
router.post("/images/:id", upload.array('images', 10), uploadProductImages);
router.put("/image/:id", upload.single('image'), updateProductMainImage);
router.delete("/image/:id", validate(deleteProductImageSchema), deleteProductImage);

export default router;