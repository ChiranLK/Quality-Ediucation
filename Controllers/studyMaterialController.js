import { StatusCodes } from "http-status-codes";
<<<<<<< HEAD
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors/customErrors.js";
import { cloudinary } from "../Middleware/uploadMiddleware.js";

// POST /api/materials
// Only tutors and admins may upload
export const createStudyMaterial = async (req, res) => {
  const { title, description, subject, grade, tags } = req.body || {};

  // required fields
  if (!title || !description || !subject || !grade) {
    throw new BadRequestError(
      "title, description, subject, and grade are required",
    );
  }

  if (!req.file) {
    throw new BadRequestError("Please provide a file to upload");
  }

  // attach uploader (protect adds full user, authenticateUser adds {userId})
  const uploaderId = req.user.userId || req.user._id;
  const materialData = {
    title: title.trim(),
    description: description.trim(),
    subject: subject.trim().toLowerCase(),
    grade: grade.trim(),
    fileUrl: req.file.path,
    uploadedBy: uploaderId,
=======
import { BadRequestError } from "../errors/customErrors.js";
import * as studyMaterialService from "../services/studyMaterialService.js";
import {
  paginatedResponse,
  successResponse,
} from "../utils/responseHandler.js";
import { validateObjectId } from "../utils/validationUtils.js";
import { asyncHandler } from "../Middleware/asyncHandler.js";

/**
 * POST /api/materials
 * Upload a new study material (Tutor/Admin only)
 */
export const createStudyMaterial = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("Please upload a file (PDF, DOC, image, etc.)");
  }

  const uploaderId = req.user._id || req.user.userId;
  const materialData = {
    ...req.body,
    fileUrl: req.file.path, // Cloudinary secure URL
>>>>>>> origin/main
  };

  const material = await studyMaterialService.createMaterial(
    materialData,
    uploaderId,
  );

  res
    .status(StatusCodes.CREATED)
    .json(successResponse("Study material uploaded successfully", material));
});

/**
 * GET /api/materials
 * Get all study materials with pagination, filtering, and search
 * Query params: page, limit, subject, grade, keyword, sort, status
 */
export const getAllStudyMaterials = asyncHandler(async (req, res) => {
  const result = await studyMaterialService.getAllMaterials(req.query);

  res.status(StatusCodes.OK).json(
    paginatedResponse("Materials retrieved successfully", result.materials, {
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit,
    }),
  );
});

/**
 * GET /api/materials/my
 * Get materials uploaded by the currently logged-in tutor/admin
 * Query params: page, limit, subject, grade, keyword, sort, status
 */
export const getMyMaterials = asyncHandler(async (req, res) => {
  const uploaderId = req.user._id || req.user.userId;
  const result = await studyMaterialService.getAllMaterials({
    ...req.query,
    uploadedBy: String(uploaderId),
  });

  res.status(StatusCodes.OK).json(
    paginatedResponse("Your materials retrieved successfully", result.materials, {
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit,
    }),
  );
});

/**
 * GET /api/materials/:id
 * Get a single study material by ID (increments view count)
 */
export const getSingleStudyMaterial = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const material = await studyMaterialService.getMaterialById(req.params.id);

  res
    .status(StatusCodes.OK)
    .json(successResponse("Material retrieved successfully", material));
});

/**
 * PATCH /api/materials/:id
 * Update a study material (uploader or admin only)
 */
export const updateStudyMaterial = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const updates = { ...req.body };

  // If a new file was uploaded, replace the URL
  if (req.file) {
    updates.fileUrl = req.file.path;
  }

  const updatedMaterial = await studyMaterialService.updateMaterial(
    req.params.id,
    updates,
    req.user,
  );

  res
    .status(StatusCodes.OK)
    .json(
      successResponse("Study material updated successfully", updatedMaterial),
    );
});

<<<<<<< HEAD
  // 3. Build the update payload — only allow safe fields
  const { title, description, subject, grade, tags } = req.body || {};
  const updates = {};

  if (title       !== undefined) updates.title       = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (subject     !== undefined) updates.subject     = subject.trim().toLowerCase();
  if (grade       !== undefined) updates.grade       = grade.trim();
  
  if (req.file) {
    updates.fileUrl = req.file.path;
  }

  if (tags !== undefined && Array.isArray(tags)) {
    updates.tags = tags.map((t) => String(t).trim().toLowerCase());
  }
=======
/**
 * DELETE /api/materials/:id
 * Delete a study material (uploader or admin only)
 */
export const deleteStudyMaterial = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  await studyMaterialService.deleteMaterial(req.params.id, req.user);
>>>>>>> origin/main

  res
    .status(StatusCodes.OK)
    .json(successResponse("Study material deleted successfully"));
});

/**
 * POST /api/materials/:id/download
 * Increment download count for a material
 */
export const incrementDownload = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const material = await studyMaterialService.incrementMetric(
    req.params.id,
    "downloads",
  );

  res
    .status(StatusCodes.OK)
    .json(successResponse("Download recorded", { downloads: material.metrics.downloads }));
});

/**
 * POST /api/materials/:id/like
 * Toggle like on a material (like if not liked, unlike if already liked)
 * Uses userid tracking to prevent duplicate likes
 */
export const toggleLike = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const userId = String(req.user._id || req.user.userId);
  const result = await studyMaterialService.toggleLike(req.params.id, userId);

<<<<<<< HEAD
  if (requesterId !== uploaderId && !isAdmin) {
    throw new UnauthorizedError(
      "You are not authorized to delete this material",
    );
  }

  // 3. Delete file from Cloudinary
  if (material.fileUrl && material.fileUrl.includes("cloudinary.com")) {
    const urlParts = material.fileUrl.split("/");
    const fileNameWithExt = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    if (folder === "study_materials") {
      const publicId = `${folder}/${fileNameWithExt.split(".")[0]}`;
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
      } catch (err) {
        console.error("Cloudinary deletion error:", err);
      }
    }
  }

  // 4. Delete document
  await StudyMaterial.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({ msg: "Study material deleted successfully" });
};
=======
  res
    .status(StatusCodes.OK)
    .json(successResponse(result.message, { likes: result.likes }));
});
>>>>>>> origin/main
