import express from "express";
import { verifyToken, isCustomer } from "../middlewares/auth.js";
import {
  addToWishlist,
  getWishlistItems,
} from "../controllers/WishlistController.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.post("/", verifyToken, isCustomer, addToWishlist);

router.get("/", verifyToken, isCustomer, getWishlistItems);

export default router; 