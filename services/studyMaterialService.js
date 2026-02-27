import StudyMaterial from "../models/StudyMaterialModel.js";
import { NotFoundError, UnauthorizedError, BadRequestError } from "../errors/customErrors.js";
import { cloudinary } from "../Middleware/uploadMiddleware.js";

/* ─────────────────────────────────────────────────────────────────────────────
   PRIVATE HELPERS
───────────────────────────────────────────────────────────────────────────── */

/**
 * Extract Cloudinary public_id from a Cloudinary URL.
 * e.g. https://res.cloudinary.com/xxx/raw/upload/v123/study_materials/abc123
 * Returns: "study_materials/abc123"
 */
const extractPublicId = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1].replace(/^v\d+\//, "");
    return pathAfterUpload.replace(/\.[^/.]+$/, ""); // strip extension
  } catch {
    return null;
  }
};

/**
 * Normalise a tags value that may arrive as:
 *  - an Array (JSON body)   → ["math","algebra"]
 *  - a JSON string          → '["math","algebra"]'
 *  - a comma-separated str  → "math,algebra"
 * Always returns a clean lowercase, trimmed, non-empty string array.
 */
const normaliseTags = (raw) => {
  if (!raw) return [];
  let arr = raw;
  if (typeof arr === "string") {
    try {
      arr = JSON.parse(arr);
    } catch {
      arr = arr.split(",");
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
};

/**
 * Escape special regex characters to prevent ReDoS / NoSQL injection
 * when building dynamic $regex queries.
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Standard populate projection for uploader — uses fullName (matches UserModel) */
const UPLOADER_FIELDS = "fullName email role";

/* ─────────────────────────────────────────────────────────────────────────────
   SERVICE FUNCTIONS
───────────────────────────────────────────────────────────────────────────── */

/**
 * Create a new study material.
 * Prevents duplicates: same title (case-insensitive) + same subject.
 */
export const createMaterial = async (data, uploaderId) => {
  const normalizedTitle   = data.title.trim();
  const normalizedSubject = data.subject.trim().toLowerCase();

  // ✅ Escape title before using in $regex to prevent ReDoS / injection
  const escaped = escapeRegex(normalizedTitle);
  const existing = await StudyMaterial.findOne({
    title:   { $regex: `^${escaped}$`, $options: "i" },
    subject: normalizedSubject,
  });

  if (existing) {
    throw new BadRequestError(
      `A material titled "${normalizedTitle}" already exists for subject "${normalizedSubject}"`
    );
  }

  const materialData = {
    ...data,
    subject:    normalizedSubject,
    uploadedBy: uploaderId,
    tags:       normaliseTags(data.tags),
  };

  // ✅ CRITICAL: If DB create fails, delete the already-uploaded Cloudinary file
  // to prevent orphaned files consuming cloud storage.
  let material;
  try {
    material = await StudyMaterial.create(materialData);
  } catch (dbError) {
    if (data.fileUrl) {
      const publicId = extractPublicId(data.fileUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
          console.warn("Cloudinary rollback: deleted orphaned file after DB failure:", publicId);
        } catch (cloudErr) {
          console.error("Cloudinary rollback failed:", cloudErr.message);
        }
      }
    }
    throw dbError; // Re-throw so the error handler sends the correct 400/500 to client
  }

  return material;
};


/**
 * Return a paginated, filtered, sorted list of materials.
 * Supported query params: subject, grade, keyword, sort, page, limit, status, uploadedBy
 */
export const getAllMaterials = async (query) => {
  const { subject, grade, keyword, sort, page, limit, status, uploadedBy } = query;

  // ✅ Whitelist status values — never trust raw query strings
  const ALLOWED_STATUS = new Set(["active", "archived", "pending"]);
  const SORT_OPTIONS   = {
    latest:  { createdAt: -1 },
    oldest:  { createdAt: 1  },
    subject: { subject:   1  },
    title:   { title:     1  },
  };

  const filter = {};
  if (subject)    filter.subject    = subject.trim().toLowerCase();
  if (grade)      filter.grade      = grade.trim();
  if (uploadedBy) filter.uploadedBy = uploadedBy;
  if (status && ALLOWED_STATUS.has(status.trim())) filter.status = status.trim();
  if (keyword)    filter.$text      = { $search: keyword.trim() };

  const sortObj  = SORT_OPTIONS[sort] ?? SORT_OPTIONS.latest;
  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip     = (pageNum - 1) * limitNum;

  const [totalCount, materials] = await Promise.all([
    StudyMaterial.countDocuments(filter),
    StudyMaterial.find(filter)
      .lean({ virtuals: true })     // ✅ virtuals:true so uploaderName is included
      .populate("uploadedBy", UPLOADER_FIELDS)
      .select("-likedBy")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
  ]);

  return {
    totalCount,
    totalPages:  Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
    limit:       limitNum,
    materials,
  };
};

/**
 * Get a single material by ID.
 * Increments view count atomically on every fetch.
 */
export const getMaterialById = async (id) => {
  const material = await StudyMaterial.findByIdAndUpdate(
    id,
    { $inc: { "metrics.views": 1 } },
    { new: true }
  )
    .lean({ virtuals: true })       // ✅ virtuals:true so uploaderName is included
    .populate("uploadedBy", UPLOADER_FIELDS)
    .select("-likedBy");


  if (!material) throw new NotFoundError(`No study material found with id: ${id}`);
  return material;
};

/**
 * Update a material's metadata or file.
 * Only the uploader or an admin may update.
 * Deletes the old Cloudinary file if a new one is uploaded.
 */
export const updateMaterial = async (id, updates, user) => {
  const material = await StudyMaterial.findById(id);
  if (!material) throw new NotFoundError(`No study material found with id: ${id}`);

  const requesterId = String(user._id || user.userId);
  const uploaderId  = String(material.uploadedBy);
  const isAdmin     = user.role === "admin";

  if (requesterId !== uploaderId && !isAdmin) {
    throw new UnauthorizedError("You are not authorized to update this material");
  }

  // Delete old Cloudinary file when a replacement is uploaded
  if (updates.fileUrl && material.fileUrl) {
    const oldPublicId = extractPublicId(material.fileUrl);
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: "raw" });
      } catch (err) {
        console.error("Cloudinary old-file deletion error:", err.message);
      }
    }
  }

  // ✅ Strip immutable / sensitive fields that must never be overwritten via PATCH
  const { uploadedBy: _u, metrics: _m, likedBy: _l, ...safeUpdates } = updates;

  if (safeUpdates.subject) safeUpdates.subject = safeUpdates.subject.trim().toLowerCase();
  if (safeUpdates.tags)    safeUpdates.tags    = normaliseTags(safeUpdates.tags); // ✅ DRY

  const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
    id,
    { $set: safeUpdates },
    { new: true, runValidators: true }
  )
    .populate("uploadedBy", UPLOADER_FIELDS)
    .select("-likedBy");           // ✅ Never expose likedBy

  return updatedMaterial;
};

/**
 * Delete a material and its associated Cloudinary file.
 * Only the uploader or an admin may delete.
 */
export const deleteMaterial = async (id, user) => {
  const material = await StudyMaterial.findById(id);
  if (!material) throw new NotFoundError(`No study material found with id: ${id}`);

  const requesterId = String(user._id || user.userId);
  const uploaderId  = String(material.uploadedBy);
  const isAdmin     = user.role === "admin";

  if (requesterId !== uploaderId && !isAdmin) {
    throw new UnauthorizedError("You are not authorized to delete this material");
  }

  // Delete from Cloudinary first; DB document removed after
  const publicId = extractPublicId(material.fileUrl);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } catch (err) {
      console.error("Cloudinary deletion error:", err.message);
    }
  }

  await StudyMaterial.findByIdAndDelete(id);
  return material;
};

/**
 * Atomically increment a numeric engagement metric (downloads only via API).
 * Views are incremented internally by getMaterialById.
 */
export const incrementMetric = async (id, field) => {
  // ✅ Whitelist — never use user input directly as a field name
  const ALLOWED_METRICS = new Set(["views", "downloads"]);
  if (!ALLOWED_METRICS.has(field)) {
    throw new BadRequestError(`Invalid metric field: ${field}`);
  }

  const material = await StudyMaterial.findByIdAndUpdate(
    id,
    { $inc: { [`metrics.${field}`]: 1 } },
    { new: true }
  ).select("metrics");             // ✅ Fetch only what's needed

  if (!material) throw new NotFoundError(`No study material found with id: ${id}`);
  return material;
};

/**
 * Toggle a like for a specific user on a material.
 * Uses $addToSet / $pull to prevent duplicate likes atomically.
 * Returns { message, likes } — never exposes the full likedBy array.
 */
export const toggleLike = async (id, userId) => {
  // First check if user already liked (lean read for speed)
  const check = await StudyMaterial.findById(id).select("likedBy metrics.likes").lean();
  if (!check) throw new NotFoundError(`No study material found with id: ${id}`);

  const alreadyLiked = check.likedBy.some((uid) => String(uid) === userId);

  const updateOp = alreadyLiked
    ? { $pull: { likedBy: userId }, $inc: { "metrics.likes": -1 } }  // Unlike
    : { $addToSet: { likedBy: userId }, $inc: { "metrics.likes": 1 } }; // Like

  const updated = await StudyMaterial.findByIdAndUpdate(id, updateOp, { new: true })
    .select("metrics.likes");      // ✅ Only return the count, not the full likedBy array

  return {
    message: alreadyLiked ? "Material unliked" : "Material liked",
    likes:   updated.metrics.likes,
  };
};
