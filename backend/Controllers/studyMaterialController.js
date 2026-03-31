import { StatusCodes } from "http-status-codes";
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

/**
 * DELETE /api/materials/:id
 * Delete a study material (uploader or admin only)
 */
export const deleteStudyMaterial = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  await studyMaterialService.deleteMaterial(req.params.id, req.user);

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

  res
    .status(StatusCodes.OK)
    .json(successResponse(result.message, { likes: result.likes }));
});
