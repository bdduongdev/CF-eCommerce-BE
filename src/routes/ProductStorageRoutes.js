import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import {
  getAllStorages,
  getStorageById,
  createStorage,
  updateStorage,
  deleteStorage,
  getTrashedStorages,
  restoreStorage,
} from "../controllers/ProductStorageController.js";
import validate from "../middlewares/validate.js";
import {
  createStorageSchema,
  updateStorageSchema,
} from "../validations/productStorage.validation.js";

const router = express.Router();

router.get("/", getAllStorages);

router.use(verifyToken, isAdmin);

router.get("/trashed", getTrashedStorages);
router.put("/restore/:id", restoreStorage);
router.get("/:id", getStorageById);
router.post("/", validate(createStorageSchema), createStorage);
router.put("/:id", validate(updateStorageSchema), updateStorage);
router.delete("/:id", deleteStorage);

export default router;
