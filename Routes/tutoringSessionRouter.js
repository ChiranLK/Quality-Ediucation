import { Router } from "express";
import { createTutoringSession } from "../Controllers/tutoringSessionController.js";
import { authenticateUser, authorizePermissions } from "../Middleware/authMiddleware.js";

const router = Router();

/**
 * POST /api/tutoring-sessions
 * Create a new tutoring session
 * Access: Tutors and Admins only
 */
router.post(
  "/",
  authenticateUser,
  authorizePermissions("tutor", "admin"),
  createTutoringSession
);

export default router;
