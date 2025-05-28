import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import {
    getAllStorages,
    getStorageById,
    createStorage,
    updateStorage,
    deleteStorage,
    getTrashedStorages,
    restoreStorage
} from "../controllers/productStorageController.js";

const router = express.Router();

router.get("/", getAllStorages);

router.use(verifyToken);
router.use(isAdmin);

router.get("/trashed", getTrashedStorages);
router.put("/restore/:id", restoreStorage);

// Routes với tham số id
router.get("/:id", getStorageById);
router.post("/", createStorage);
router.put("/:id", updateStorage);
router.delete("/:id", deleteStorage);

export default router;