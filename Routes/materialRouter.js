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
 *   3. validateInput    — validate body FIRST (reject bad requests before uploading)
 *   4. upload           — upload file to Cloudinary only after body is valid
 *   5. handleUploadErr  — convert Multer errors (e.g. file too large) to 400
 *   6. createStudyMat   — controller
 */
router.post(
  "/",
  protect,
  authorizePermissions("tutor", "admin"),
  validateStudyMaterialInput,        // ✅ Body validated BEFORE file upload
  uploadMaterial.single("file"),     // ✅ Upload only if body is valid
  handleUploadError,                 // ✅ Handle Multer errors gracefully
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
  validateStudyMaterialUpdate,       // ✅ Body validated BEFORE file upload
  uploadMaterial.single("file"),     // ✅ Upload only if body is valid
  handleUploadError,                 // ✅ Handle Multer errors gracefully
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
