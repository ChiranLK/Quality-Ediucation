import { Router } from "express";
import {
  createStudyMaterial,
  getAllStudyMaterials,
  getMyMaterials,
  getSingleStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  incrementDownload,
  toggleLike,
} from "../Controllers/studyMaterialController.js";
import { protect, authorizePermissions } from "../Middleware/authMiddleware.js";
import {
  validateStudyMaterialInput,
  validateStudyMaterialUpdate,
} from "../Middleware/studyMaterialValidation.js";
import { uploadMaterial, handleUploadError } from "../Middleware/uploadMiddleware.js";

const router = Router();

/**
 * @route   GET /api/materials
 * @access  Private
 * @desc    Get all materials with pagination, filtering, and search
 * @query   page, limit, subject, grade, keyword, sort, status
 */
router.get("/", protect, getAllStudyMaterials);

/**
 * @route   GET /api/materials/my
 * @access  Private (Tutor/Admin only)
 * @desc    Get materials uploaded by the currently logged-in user
 * @query   page, limit, subject, grade, keyword, sort, status
 */
router.get("/my", protect, authorizePermissions("tutor", "admin"), getMyMaterials);

/**
 * @route   GET /api/materials/:id
 * @access  Private
 * @desc    Get a single material by ID (increments view count)
 */
router.get("/:id", protect, getSingleStudyMaterial);

/**
 * @route   POST /api/materials
 * @access  Private (Tutor/Admin only)
 * @desc    Create a new study material (file upload required)
 *
 * ✅ Middleware order:
 *   1. protect          — authenticate JWT
 *   2. authorizePerms   — only tutor/admin
 *   3. upload           — Multer parses form-data AND uploads to Cloudinary
 *   4. handleUploadErr  — catch Multer file size/type errors
 *   5. validateInput    — validate req.body (deletes file if invalid)
 *   6. createStudyMat   — controller
 */
router.post(
  "/",
  protect,
  authorizePermissions("tutor", "admin"),
  uploadMaterial.single("file"),     // ✅ MUST run first to parse multipart/form-data
  handleUploadError,
  validateStudyMaterialInput,        // ✅ Validates parsed body, cleans up file if error
  createStudyMaterial,
);

/**
 * @route   PATCH /api/materials/:id
 * @access  Private (Tutor/Admin only)
 * @desc    Update a study material (file upload optional)
 */
router.patch(
  "/:id",
  protect,
  authorizePermissions("tutor", "admin"),
  uploadMaterial.single("file"),     // ✅ MUST run first to parse multipart/form-data
  handleUploadError,
  validateStudyMaterialUpdate,       // ✅ Validates parsed body, cleans up file if error
  updateStudyMaterial,
);

/**
 * @route   DELETE /api/materials/:id
 * @access  Private (Tutor/Admin only)
 * @desc    Delete a study material and its associated Cloudinary file
 */
router.delete("/:id", protect, authorizePermissions("tutor", "admin"), deleteStudyMaterial);

/**
 * @route   POST /api/materials/:id/download
 * @access  Private
 * @desc    Record a download (increments download count)
 */
router.post("/:id/download", protect, incrementDownload);

/**
 * @route   POST /api/materials/:id/like
 * @access  Private
 * @desc    Toggle like/unlike on a material
 */
router.post("/:id/like", protect, toggleLike);

export default router;
