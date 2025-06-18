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
    updateProductStatus,
    getProductBySlug,
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
router.get("/show/:id", getProductById);
router.get("/:slug", getProductBySlug);

router.get("/image-test/:filename", (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(process.cwd(), "uploads", "products", filename));
});

router.use(verifyToken);

router.get("/trashed", isAdmin, getTrashedProducts);
router.post("/create", isAdmin, upload.single('image'), validate(createProductSchema), createProduct);
router.put("/update/:id", isAdmin, upload.single('image'), validate(updateProductSchema), updateProduct);
router.patch("/status/:id", isAdmin, validate(updateProductStatusSchema), updateProductStatus);
router.delete("/delete/:id", isAdmin, deleteProduct);
router.put("/restore/:id", isAdmin, restoreProduct);

router.post("/images/:id", isAdmin, upload.array('images', 10), uploadProductImages);
router.put("/image/:id", isAdmin, upload.single('image'), updateProductMainImage);
router.delete("/image/:id", isAdmin, validate(deleteProductImageSchema), deleteProductImage);

export default router;