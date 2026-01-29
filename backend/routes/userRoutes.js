import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  allUsers,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getUserProfile);

export default router;
