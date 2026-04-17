import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createReview, getUserReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.route("/").post(protect, createReview);
router.route("/user/:userId").get(getUserReviews);

export default router;
