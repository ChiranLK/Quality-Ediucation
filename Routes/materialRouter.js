import { Router } from "express";
import { createStudyMaterial, getAllStudyMaterials, getSingleStudyMaterial, updateStudyMaterial, deleteStudyMaterial } from "../Controllers/studyMaterialController.js";
import { protect, authorizePermissions } from "../Middleware/authMiddleware.js";
import { upload } from "../Middleware/uploadMiddleware.js";

const router = Router();

// GET /api/materials — any authenticated user can browse (with filters + pagination)
router.get("/", protect, getAllStudyMaterials);

// GET /api/materials/:id — fetch a single material by ID
router.get("/:id", protect, getSingleStudyMaterial);

// PATCH /api/materials/:id — uploader or admin only
router.patch("/:id", protect, upload.single("file"), updateStudyMaterial);

// DELETE /api/materials/:id — uploader or admin only
router.delete("/:id", protect, deleteStudyMaterial);

// POST /api/materials — only tutors and admins can upload
router.post(
  "/",
  protect,
  authorizePermissions("tutor", "admin"),
  upload.single("file"),
  createStudyMaterial,
);

export default router;
