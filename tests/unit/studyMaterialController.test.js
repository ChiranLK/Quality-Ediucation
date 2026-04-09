/**
 * UNIT TESTS — Controllers/studyMaterialController.js
 *
 * Tests each controller function in isolation using mocked service layer.
 * Uses jest.spyOn for named exports (ESM-compatible pattern).
 *
 * Covers all controller functions:
 *   createStudyMaterial, getAllStudyMaterials, getMyMaterials,
 *   getSingleStudyMaterial, updateStudyMaterial, deleteStudyMaterial,
 *   incrementDownload, toggleLike
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

// ─── Mock the service layer (auto-mock works for default/namespace imports) ──
jest.mock("../../services/studyMaterialService.js");
jest.mock("../../models/StudyMaterialModel.js");

import * as studyMaterialService from "../../services/studyMaterialService.js";
import * as validationUtils from "../../utils/validationUtils.js";

import {
  createStudyMaterial,
  getAllStudyMaterials,
  getMyMaterials,
  getSingleStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  incrementDownload,
  toggleLike,
} from "../../Controllers/studyMaterialController.js";

import { BadRequestError, NotFoundError } from "../../errors/customErrors.js";

// ─── Shared builders ─────────────────────────────────────────────────────────
const buildMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const buildUser = (role = "tutor") => ({
  _id: new mongoose.Types.ObjectId(),
  email: `${role}@test.com`,
  role,
});

const buildMaterial = (uploaderId) => ({
  _id: new mongoose.Types.ObjectId().toString(),
  title: "Algebra Basics",
  description: "Introduction to algebra for grade 10 students.",
  subject: "mathematics",
  grade: "10th",
  fileUrl: "https://res.cloudinary.com/demo/raw/upload/v1/study_materials/test.pdf",
  uploadedBy: uploaderId,
  metrics: { views: 0, downloads: 0, likes: 0 },
  status: "active",
});

// ─── Spy holders ─────────────────────────────────────────────────────────────
let validateObjectIdSpy;

beforeEach(() => {
  jest.clearAllMocks();
  // Spy on validateObjectId so tests can control its behavior
  validateObjectIdSpy = jest.spyOn(validationUtils, "validateObjectId");
});

afterEach(() => {
  validateObjectIdSpy.mockRestore();
});

// ════════════════════════════════════════════════════════════════════════════
//  createStudyMaterial
// ════════════════════════════════════════════════════════════════════════════
describe("📤 createStudyMaterial controller", () => {
  // ✅ Success — file uploaded and material created
  test("should return 201 and the created material", async () => {
    const user = buildUser("tutor");
    const material = buildMaterial(user._id);

    const req = {
      user,
      file: { path: "https://res.cloudinary.com/demo/raw/upload/v1/study_materials/test.pdf" },
      body: { title: "Algebra Basics", description: "Some description that is long.", subject: "mathematics", grade: "10th" },
    };
    const res = buildMockRes();

    studyMaterialService.createMaterial.mockResolvedValue(material);

    await createStudyMaterial(req, res, jest.fn());

    expect(studyMaterialService.createMaterial).toHaveBeenCalledWith(
      expect.objectContaining({ fileUrl: req.file.path }),
      user._id
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: expect.stringMatching(/uploaded/i) })
    );
  });

  // ❌ Error — no file attached
  test("should throw BadRequestError when req.file is missing", async () => {
    const req = { user: buildUser(), file: null, body: {} };
    const res = buildMockRes();

    await expect(createStudyMaterial(req, res, jest.fn())).rejects.toThrow(BadRequestError);
    expect(studyMaterialService.createMaterial).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  getAllStudyMaterials
// ════════════════════════════════════════════════════════════════════════════
describe("📋 getAllStudyMaterials controller", () => {
  // ✅ Success — returns paginated list
  test("should return 200 with paginated materials and pagination metadata", async () => {
    const user = buildUser("tutor");
    const materials = [buildMaterial(user._id)];

    const req = { user, query: { page: "1", limit: "10" } };
    const res = buildMockRes();

    studyMaterialService.getAllMaterials.mockResolvedValue({
      materials,
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
      limit: 10,
    });

    await getAllStudyMaterials(req, res, jest.fn());

    expect(studyMaterialService.getAllMaterials).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        pagination: expect.objectContaining({ total: 1 }),
      })
    );
  });

  // 🔲 Edge case — empty results
  test("should return 200 with an empty data array when no materials exist", async () => {
    const req = { user: buildUser(), query: {} };
    const res = buildMockRes();

    studyMaterialService.getAllMaterials.mockResolvedValue({
      materials: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 10,
    });

    await getAllStudyMaterials(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [] }));
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  getMyMaterials
// ════════════════════════════════════════════════════════════════════════════
describe("👤 getMyMaterials controller", () => {
  // ✅ Success — scoped to logged-in user's ID
  test("should call getAllMaterials with uploadedBy matching the logged-in user", async () => {
    const user = buildUser("tutor");
    const req = { user, query: { page: "1" } };
    const res = buildMockRes();

    studyMaterialService.getAllMaterials.mockResolvedValue({
      materials: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 10,
    });

    await getMyMaterials(req, res, jest.fn());

    expect(studyMaterialService.getAllMaterials).toHaveBeenCalledWith(
      expect.objectContaining({ uploadedBy: String(user._id) })
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  getSingleStudyMaterial
// ════════════════════════════════════════════════════════════════════════════
describe("🔍 getSingleStudyMaterial controller", () => {
  const validId = new mongoose.Types.ObjectId().toString();

  // ✅ Success — material found
  test("should return 200 with the material when ID is valid", async () => {
    const material = buildMaterial(new mongoose.Types.ObjectId());
    const req = { user: buildUser(), params: { id: validId } };
    const res = buildMockRes();

    validateObjectIdSpy.mockReturnValue(validId);
    studyMaterialService.getMaterialById.mockResolvedValue(material);

    await getSingleStudyMaterial(req, res, jest.fn());

    expect(validateObjectIdSpy).toHaveBeenCalledWith(validId);
    expect(studyMaterialService.getMaterialById).toHaveBeenCalledWith(validId);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: material })
    );
  });

  // ❌ Error — invalid ID format
  test("should throw BadRequestError for an invalid ObjectId", async () => {
    const req = { user: buildUser(), params: { id: "bad-id" } };
    const res = buildMockRes();

    validateObjectIdSpy.mockImplementation(() => {
      throw new BadRequestError('Invalid ID format: "bad-id" is not a valid MongoDB ObjectId');
    });

    await expect(getSingleStudyMaterial(req, res, jest.fn())).rejects.toThrow(BadRequestError);
    expect(studyMaterialService.getMaterialById).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  updateStudyMaterial
// ════════════════════════════════════════════════════════════════════════════
describe("✏️ updateStudyMaterial controller", () => {
  const validId = new mongoose.Types.ObjectId().toString();

  // ✅ Success — updates without a new file
  test("should return 200 and pass body data to service when no new file", async () => {
    const user = buildUser("tutor");
    const updated = buildMaterial(user._id);
    const req = { user, params: { id: validId }, body: { title: "Updated Title" }, file: null };
    const res = buildMockRes();

    validateObjectIdSpy.mockReturnValue(validId);
    studyMaterialService.updateMaterial.mockResolvedValue(updated);

    await updateStudyMaterial(req, res, jest.fn());

    expect(studyMaterialService.updateMaterial).toHaveBeenCalledWith(
      validId,
      expect.objectContaining({ title: "Updated Title" }),
      user
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  // ✅ Success — new file provided, fileUrl injected from req.file.path
  test("should inject fileUrl from req.file.path when a new file is uploaded", async () => {
    const user = buildUser("tutor");
    const newFileUrl = "https://res.cloudinary.com/demo/raw/upload/v1/study_materials/new.pdf";
    const updated = { ...buildMaterial(user._id), fileUrl: newFileUrl };

    const req = {
      user,
      params: { id: validId },
      body: { title: "Updated Title" },
      file: { path: newFileUrl },
    };
    const res = buildMockRes();

    validateObjectIdSpy.mockReturnValue(validId);
    studyMaterialService.updateMaterial.mockResolvedValue(updated);

    await updateStudyMaterial(req, res, jest.fn());

    expect(studyMaterialService.updateMaterial).toHaveBeenCalledWith(
      validId,
      expect.objectContaining({ fileUrl: newFileUrl }),
      user
    );
  });

  // ❌ Error — service throws (e.g. not found or unauthorized)
  test("should propagate NotFoundError thrown by the service", async () => {
    const user = buildUser("tutor");
    const req = { user, params: { id: validId }, body: {}, file: null };

    validateObjectIdSpy.mockReturnValue(validId);
    studyMaterialService.updateMaterial.mockRejectedValue(
      new NotFoundError("Study material not found")
    );

    await expect(updateStudyMaterial(req, buildMockRes(), jest.fn())).rejects.toThrow(NotFoundError);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  deleteStudyMaterial
// ════════════════════════════════════════════════════════════════════════════
describe("🗑️ deleteStudyMaterial controller", () => {
  const validId = new mongoose.Types.ObjectId().toString();

  // ✅ Success
  test("should return 200 with a success message after deletion", async () => {
    const user = buildUser("tutor");
    const req = { user, params: { id: validId } };
    const res = buildMockRes();

    validateObjectIdSpy.mockReturnValue(validId);
    studyMaterialService.deleteMaterial.mockResolvedValue(true);

    await deleteStudyMaterial(req, res, jest.fn());

    expect(studyMaterialService.deleteMaterial).toHaveBeenCalledWith(validId, user);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/deleted/i) })
    );
  });

  // ❌ Error — invalid ID
  test("should throw BadRequestError for an invalid ObjectId", async () => {
    validateObjectIdSpy.mockImplementation(() => {
      throw new BadRequestError("Invalid ID");
    });

    const req = { user: buildUser(), params: { id: "bad" } };
    await expect(deleteStudyMaterial(req, buildMockRes(), jest.fn())).rejects.toThrow(BadRequestError);
    expect(studyMaterialService.deleteMaterial).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  incrementDownload
// ════════════════════════════════════════════════════════════════════════════
describe("📥 incrementDownload controller", () => {
  const validId = new mongoose.Types.ObjectId().toString();

  // ✅ Success
  test("should return 200 with updated download count", async () => {
    const req = { user: buildUser(), params: { id: validId } };
    const res = buildMockRes();

    validateObjectIdSpy.mockReturnValue(validId);
    studyMaterialService.incrementMetric.mockResolvedValue({
      metrics: { downloads: 5 },
    });

    await incrementDownload(req, res, jest.fn());

    expect(studyMaterialService.incrementMetric).toHaveBeenCalledWith(validId, "downloads");
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: { downloads: 5 } })
    );
  });

  // ❌ Error — service throws for invalid ID
  test("should propagate BadRequestError from service for invalid ID", async () => {
    const req = { user: buildUser(), params: { id: "invalid" } };

    validateObjectIdSpy.mockImplementation(() => {
      throw new BadRequestError("Invalid ID");
    });

    await expect(incrementDownload(req, buildMockRes(), jest.fn())).rejects.toThrow(BadRequestError);
    expect(studyMaterialService.incrementMetric).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  toggleLike
// ════════════════════════════════════════════════════════════════════════════
describe("❤️ toggleLike controller", () => {
  const validId = new mongoose.Types.ObjectId().toString();

  // ✅ Success — like action
  test("should return 200 with like count and liked message", async () => {
    const user = buildUser("user");
    const req = { user, params: { id: validId } };
    const res = buildMockRes();

    validateObjectIdSpy.mockReturnValue(validId);
    studyMaterialService.toggleLike.mockResolvedValue({
      message: "Material liked",
      likes: 1,
    });

    await toggleLike(req, res, jest.fn());

    expect(studyMaterialService.toggleLike).toHaveBeenCalledWith(
      validId,
      String(user._id)
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Material liked",
        data: { likes: 1 },
      })
    );
  });

  // 🔲 Edge case — unlike toggle
  test("should return 200 with unliked message when toggling back", async () => {
    const user = buildUser("user");
    const req = { user, params: { id: validId } };
    const res = buildMockRes();

    validateObjectIdSpy.mockReturnValue(validId);
    studyMaterialService.toggleLike.mockResolvedValue({
      message: "Material unliked",
      likes: 0,
    });

    await toggleLike(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Material unliked",
        data: { likes: 0 },
      })
    );
  });
});
