import express from "express";
import { upsertProgress, getMyProgress, getProgressByTutor, getProgressByStudent, deleteProgress } from "../Controllers/progressController.js";

import { protect } from "../Middleware/authMiddleware.js";


const router = express.Router();

router.post("/", protect, upsertProgress);
router.delete("/:id", protect, deleteProgress);

// More specific routes FIRST (with parameters before generic /me)
router.get("/student/:studentId", protect, getProgressByStudent);
router.get("/tutor/:tutorId", protect, getProgressByTutor);

// Generic routes LAST
router.get("/me", protect, getMyProgress);

export default router;