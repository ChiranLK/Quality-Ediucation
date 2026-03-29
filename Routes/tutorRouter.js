import { Router } from "express";
import {
  getAllTutors,
  getTutorsBySubject,
  getAvailableSubjects,
  getTutorById,
  getTutorStudents,
} from "../Controllers/tutorController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = Router();

// Public routes (no authentication required)
router.get("/subjects", getAvailableSubjects);
router.get("/", getAllTutors);

// Protected routes (require Authorization header token) - MUST come before generic :id route
router.get("/:tutorId/my-students", protect, getTutorStudents);

// More public routes
router.get("/subject/:subject", getTutorsBySubject);
router.get("/:id", getTutorById);

export default router;
