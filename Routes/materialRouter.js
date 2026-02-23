import { Router } from "express";
import { createStudyMaterial, getAllStudyMaterials, getSingleStudyMaterial } from "../Controllers/studyMaterialController.js";
import { protect, authorizePermissions } from "../Middleware/authMiddleware.js";

const router = Router();

// GET /api/materials — any authenticated user can browse (with filters + pagination)
router.get("/", protect, getAllStudyMaterials);

// GET /api/materials/:id — fetch a single material by ID
router.get("/:id", protect, getSingleStudyMaterial);

// POST /api/materials — only tutors and admins can upload
router.post(
  "/",
  protect,
  authorizePermissions("tutor", "admin"),
  createStudyMaterial,
);

export default router;
