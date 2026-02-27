import { body, validationResult } from "express-validator";
import { BadRequestError } from "../errors/customErrors.js";
import { cloudinary } from "./uploadMiddleware.js";

/**
 * Extract Cloudinary public_id from a Cloudinary URL.
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

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        
        // ✅ CRITICAL: If validation fails AFTER Multer uploaded the file to Cloudinary,
        // we must delete the orphaned file to prevent cloud storage leaks.
        if (req.file && req.file.path) {
          const publicId = extractPublicId(req.file.path);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
              console.warn("Cloudinary rollback: deleted orphaned file due to validation error:", publicId);
            } catch (cloudErr) {
              console.error("Cloudinary rollback failed during validation:", cloudErr.message);
            }
          }
        }

        next(new BadRequestError(errorMessages.join(", ")));
        return;
      }
      next();
    },
  ];
};

export const validateStudyMaterialInput = withValidationErrors([
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isString()
    .isLength({ max: 50 })
    .withMessage("Subject cannot exceed 50 characters"),
  body("grade")
    .notEmpty()
    .withMessage("Grade is required")
    .isString()
    .isLength({ max: 20 })
    .withMessage("Grade cannot exceed 20 characters"),
  // fileUrl is NOT validated here — it comes from Multer/Cloudinary via req.file
  body("tags")
    .optional()
    .custom((value) => {
      let arr = value;
      if (typeof value === "string") {
        try { arr = JSON.parse(value); } catch { arr = value.split(","); }
      }
      if (!Array.isArray(arr)) throw new Error("Tags must be an array or string format");
      return true;
    }),
]);

export const validateStudyMaterialUpdate = withValidationErrors([
  body("title")
    .optional()
    .isString()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),
  body("description")
    .optional()
    .isString()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("subject")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Subject cannot exceed 50 characters"),
  body("grade")
    .optional()
    .isString()
    .isLength({ max: 20 })
    .withMessage("Grade cannot exceed 20 characters"),
  // fileUrl comes from Multer/Cloudinary via req.file, not body
  body("tags")
    .optional()
    .custom((value) => {
      let arr = value;
      if (typeof value === "string") {
        try { arr = JSON.parse(value); } catch { arr = value.split(","); }
      }
      if (!Array.isArray(arr)) throw new Error("Tags must be an array or string format");
      return true;
    }),
]);
