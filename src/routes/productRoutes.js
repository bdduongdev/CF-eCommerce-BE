import express from "express";
import { verifyToken, isAdmin, isCustomer, isAdminOrCustomer } from "../middlewares/auth.js";
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getTrashedProducts,
    restoreProduct
} from "../controllers/ProductController.js";
import validate from "../middlewares/validate.js";
import { createProductSchema, updateProductSchema } from "../validations/product.validation.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/show/:id", getProductById);

router.use(verifyToken);

router.get("/trashed", isAdmin, getTrashedProducts);
router.post("/create", isAdmin, validate(createProductSchema), createProduct);
router.put("/update/:id", isAdmin, validate(updateProductSchema), updateProduct);
router.delete("/delete/:id", isAdmin, deleteProduct);
router.put("/restore/:id", isAdmin, restoreProduct);

export default router;