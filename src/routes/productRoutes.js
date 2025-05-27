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
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/show/:id", getProductById);
router.get("/trashed", isAdmin, getTrashedProducts);

router.use(verifyToken);

router.post("/create", isAdmin, createProduct);
router.put("/update/:id", isAdmin, updateProduct);
router.delete("/delete/:id", isAdmin, deleteProduct);
router.put("/restore/:id", isAdmin, restoreProduct);

export default router;