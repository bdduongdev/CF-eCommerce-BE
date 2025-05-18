import express from "express";
import { verifyToken, isAdmin, isCustomer, isAdminOrCustomer } from "../middlewares/auth.js";
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from "../controllers/productController.js";

const router = express.Router();

// Route công khai - ai cũng có thể truy cập
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Route yêu cầu đăng nhập
router.use(verifyToken);

// Route chỉ dành cho admin
router.post("/", isAdmin, createProduct);
router.put("/:id", isAdmin, updateProduct);
router.delete("/:id", isAdmin, deleteProduct);

export default router;