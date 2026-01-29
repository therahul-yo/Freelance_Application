import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createBid, getProjectBids, getMyBids, acceptBid } from "../controllers/bidController.js";

const router = express.Router();

router.route("/").post(protect, createBid);
router.route("/my").get(protect, getMyBids);
router.route("/project/:projectId").get(protect, getProjectBids);
router.route("/:id/accept").put(protect, acceptBid);

export default router;
