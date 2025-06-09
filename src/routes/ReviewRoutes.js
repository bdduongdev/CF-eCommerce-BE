import express from "express";
import { verifyToken, isAdmin, isCustomer, isAdminOrCustomer } from "../middlewares/auth.js";
import { 
    getAllReviews,
} from "../controllers/ReviewController.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.get("/", getAllReviews);

export default router;