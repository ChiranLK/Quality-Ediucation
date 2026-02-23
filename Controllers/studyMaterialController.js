import StudyMaterial from "../models/StudyMaterialModel.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";

// POST /api/materials
// Only tutors and admins may upload
export const createStudyMaterial = async (req, res) => {
  const { title, description, subject, grade, fileUrl, tags } = req.body || {};

  // required fields
  if (!title || !description || !subject || !grade || !fileUrl) {
    throw new BadRequestError(
      "title, description, subject, grade and fileUrl are required",
    );
  }

  // attach uploader (protect adds full user, authenticateUser adds {userId})
  const uploaderId = req.user.userId || req.user._id;
  const materialData = {
    title: title.trim(),
    description: description.trim(),
    subject: subject.trim().toLowerCase(),
    grade: grade.trim(),
    fileUrl: fileUrl.trim(),
    uploadedBy: uploaderId,
  };
  if (tags && Array.isArray(tags)) {
    materialData.tags = tags.map((t) => String(t).trim().toLowerCase());
  }

  const material = await StudyMaterial.create(materialData);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Study material uploaded", material });
};

// GET /api/materials
// Public — any authenticated user can browse materials
export const getAllStudyMaterials = async (req, res) => {
  const { subject, grade, keyword } = req.query;

  // --- build filter object ---
  const filter = {};

  if (subject) {
    // stored lowercase; normalise the incoming value too
    filter.subject = subject.trim().toLowerCase();
  }

  if (grade) {
    filter.grade = grade.trim();
  }

  if (keyword) {
    // case-insensitive partial match on title
    filter.title = { $regex: keyword.trim(), $options: "i" };
  }

  // --- pagination ---
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // run count and data queries in parallel for performance
  const [totalCount, materials] = await Promise.all([
    StudyMaterial.countDocuments(filter),
    StudyMaterial.find(filter)
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.status(StatusCodes.OK).json({
    totalCount,
    totalPages,
    currentPage: page,
    limit,
    materials,
  });
};

// GET /api/materials/:id
// Any authenticated user can fetch a single material
export const getSingleStudyMaterial = async (req, res) => {
  const { id } = req.params;

  const material = await StudyMaterial.findById(id).populate(
    "uploadedBy",
    "name email role",
  );

  if (!material) {
    throw new NotFoundError(`No study material found with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({ material });
};
