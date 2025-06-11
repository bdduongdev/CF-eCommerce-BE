import express from "express";
import { verifyToken, isCustomer } from "../middlewares/auth.js";
import {
  getAllReviews,
  createReview,
} from "../controllers/ReviewController.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.get("/", getAllReviews);
router.post("/", verifyToken, isCustomer, createReview);

export default router;