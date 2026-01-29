import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProjects,
  getProjectById,
  createProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.route("/").get(getProjects).post(protect, createProject);
router.route("/:id").get(getProjectById);

export default router;
