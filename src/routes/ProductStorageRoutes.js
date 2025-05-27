import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import {
    getAllStorages,
    getStorageById,
    createStorage,
    updateStorage,
    deleteStorage
} from "../controllers/productStorageController.js";

const router = express.Router();

// Route công khai
router.get("/", getAllStorages);
router.get("/:id", getStorageById);

// Route yêu cầu quyền admin
router.use(verifyToken);
router.use(isAdmin);

router.post("/", createStorage);
router.put("/:id", updateStorage);
router.delete("/:id", deleteStorage);

export default router;