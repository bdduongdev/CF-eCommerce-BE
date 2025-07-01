import express from "express";
import { verifyToken, isCustomer } from "../middlewares/auth.js";
import {
  getAllReviews,
  createReview,
} from "../controllers/ReviewController.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.get("/", getAllReviews);

router.use(verifyToken, isCustomer);

router.post("/", createReview);

export default router;