import express from "express";
import { upsertProgress, getMyProgress, getProgressByTutor, getProgressByStudent } from "../Controllers/progressController.js";

import { protect } from "../Middleware/authMiddleware.js";


const router = express.Router();

router.post("/", protect, upsertProgress);

router.get("/me", protect, getMyProgress);
router.get("/student/:studentId", protect, getProgressByStudent);
router.get("/tutor/:tutorId", protect, getProgressByTutor);

export default router;