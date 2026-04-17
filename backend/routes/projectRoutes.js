import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProjects,
  getProjectById,
  getMyProjects,
  createProject,
  updateProjectStatus,
} from "../controllers/projectController.js";

const router = express.Router();

router.route("/").get(getProjects).post(protect, createProject);
router.route("/my").get(protect, getMyProjects);
router.route("/:id/status").put(protect, updateProjectStatus);
router.route("/:id").get(getProjectById);

export default router;
