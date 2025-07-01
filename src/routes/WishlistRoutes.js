import express from "express";
import { verifyToken, isCustomer } from "../middlewares/auth.js";
import {
  addToWishlist,
  getWishlistItems,
} from "../controllers/WishlistController.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.use(verifyToken, isCustomer);

router.post("/", addToWishlist);

router.get("/", getWishlistItems);

export default router; 