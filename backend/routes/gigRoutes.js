import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getGigs, 
  getGigById, 
  createGig, 
  getMyGigs, 
  updateGig, 
  deleteGig,
  purchaseGig
} from "../controllers/gigController.js";

const router = express.Router();

router.route("/").get(getGigs).post(protect, createGig);
router.route("/my").get(protect, getMyGigs);
router.route("/:id/purchase").post(protect, purchaseGig);
router.route("/:id").get(getGigById).put(protect, updateGig).delete(protect, deleteGig);

export default router;
