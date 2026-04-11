/**
 * UNIT TESTS — Controllers/progressController.js
 *
 * Tests each progress controller function in isolation using mocked dependencies.
 * Covers permission models (student, tutor, admin), upsert logic, and queries.
 *
 * Covers all progress functions:
 *   upsertProgress, getMyProgress, getProgressByStudent, getProgressByTutor,
 *   getAllProgress, deleteProgress
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

// ─── Mock the dependencies ──────────────────────────────────────────────────
jest.mock("../../models/ProgressModel.js");
jest.mock("../../models/UserModel.js");

import Progress from "../../models/ProgressModel.js";
import User from "../../models/UserModel.js";

import {
  upsertProgress,
  getMyProgress,
  getProgressByStudent,
  getProgressByTutor,
  getAllProgress,
  deleteProgress,
} from "../../Controllers/progressController.js";

// ─── Helper functions ───────────────────────────────────────────────────────

const buildMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const buildUser = (role = "user", overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  fullName: "Test User",
  email: "test@example.com",
  role,
  ...overrides,
});

const buildProgress = (studentId, tutorId, overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  student: studentId,
  tutor: tutorId,
  topic: "Algebra",
  completionPercent: 75,
  notes: "Good progress",
  updatedBy: tutorId,
  session: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ tests for upsertProgress
// ════════════════════════════════════════════════════════════════════════════
describe("📈 upsertProgress", () => {
  beforeEach(() => jest.clearAllMocks());

  // ✅ SUCCESS: Tutor updates student's progress
  test("tutor should upsert student progress with topic", async () => {
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const progress = buildProgress(student._id, tutor._id);

    const req = {
      user: tutor,
      body: {
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Algebra",
        completionPercent: 75,
        notes: "Good progress",
      },
    };
    const res = buildMockRes();

    Progress.findOneAndUpdate = jest.fn().mockResolvedValue(progress);

    await upsertProgress(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Progress saved",
        progress: expect.any(Object),
      })
    );
    expect(Progress.findOneAndUpdate).toHaveBeenCalled();
  });

  // ✅ SUCCESS: Student updates own progress
  test("student should update own progress", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const progress = buildProgress(student._id, tutor._id);

    const req = {
      user: student,
      body: {
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Geometry",
        completionPercent: 50,
      },
    };
    const res = buildMockRes();

    Progress.findOneAndUpdate = jest.fn().mockResolvedValue(progress);

    await upsertProgress(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Progress saved" })
    );
  });

  // ✅ SUCCESS: Upsert with sessionId
  test("should upsert progress with sessionId", async () => {
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const sessionId = new mongoose.Types.ObjectId();
    const progress = buildProgress(student._id, tutor._id, { session: sessionId });

    const req = {
      user: tutor,
      body: {
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        sessionId: sessionId.toString(),
        completionPercent: 100,
      },
    };
    const res = buildMockRes();

    Progress.findOneAndUpdate = jest.fn().mockResolvedValue(progress);

    await upsertProgress(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Progress saved" })
    );
  });

  // ❌ FAIL: Invalid studentId
  test("should reject invalid studentId", async () => {
    const tutor = buildUser("tutor");
    const req = {
      user: tutor,
      body: {
        studentId: "invalid-id",
        tutorId: tutor._id.toString(),
        topic: "Algebra",
      },
    };
    const res = buildMockRes();

    await upsertProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Valid studentId is required" })
    );
  });

  // ❌ FAIL: Invalid tutorId
  test("should reject invalid tutorId", async () => {
    const student = buildUser("user");
    const req = {
      user: student,
      body: {
        studentId: student._id.toString(),
        tutorId: "invalid-id",
        topic: "Algebra",
      },
    };
    const res = buildMockRes();

    await upsertProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });

  // ❌ FAIL: Completion percent out of range
  test("should reject completionPercent < 0", async () => {
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const req = {
      user: tutor,
      body: {
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        completionPercent: -1,
      },
    };
    const res = buildMockRes();

    await upsertProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "completionPercent must be 0-100" })
    );
  });

  test("should reject completionPercent > 100", async () => {
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const req = {
      user: tutor,
      body: {
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        completionPercent: 101,
      },
    };
    const res = buildMockRes();

    await upsertProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });

  // ❌ FAIL: Permission - tutor updating other tutor's student
  test("tutor should NOT update other tutor's student progress", async () => {
    const tutor1 = buildUser("tutor");
    const tutor2 = buildUser("tutor");
    const student = buildUser("user");
    const req = {
      user: tutor1,
      body: {
        studentId: student._id.toString(),
        tutorId: tutor2._id.toString(),
        topic: "Algebra",
      },
    };
    const res = buildMockRes();

    await upsertProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Tutor can update only their own students' progress",
      })
    );
  });

  // ❌ FAIL: Permission - student updating other student's progress
  test("student should NOT update other student's progress", async () => {
    const student1 = buildUser("user");
    const student2 = buildUser("user");
    const tutor = buildUser("tutor");
    const req = {
      user: student1,
      body: {
        studentId: student2._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Algebra",
      },
    };
    const res = buildMockRes();

    await upsertProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Student can update only their own progress",
      })
    );
  });

  // ✅ SUCCESS: Admin can update any progress
  test("admin should update any progress", async () => {
    const admin = buildUser("admin");
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const progress = buildProgress(student._id, tutor._id);

    const req = {
      user: admin,
      body: {
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        completionPercent: 90,
      },
    };
    const res = buildMockRes();

    Progress.findOneAndUpdate = jest.fn().mockResolvedValue(progress);

    await upsertProgress(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Progress saved" })
    );
  });

  // ❌ FAIL: Invalid sessionId
  test("should reject invalid sessionId", async () => {
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const req = {
      user: tutor,
      body: {
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        sessionId: "invalid-session-id",
        completionPercent: 80,
      },
    };
    const res = buildMockRes();

    await upsertProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid sessionId" })
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ tests for getMyProgress
// ════════════════════════════════════════════════════════════════════════════
describe("📖 getMyProgress", () => {
  beforeEach(() => jest.clearAllMocks());

  test("student should view own progress records", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const progresses = [
      buildProgress(student._id, tutor._id, { topic: "Algebra" }),
      buildProgress(student._id, tutor._id, { topic: "Geometry" }),
    ];

    const req = { user: student };
    const res = buildMockRes();

    Progress.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(progresses),
      }),
    });

    await getMyProgress(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 2,
      progress: progresses,
    });
  });

  test("student with no progress should return empty", async () => {
    const student = buildUser("user");
    const req = { user: student };
    const res = buildMockRes();

    Progress.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      }),
    });

    await getMyProgress(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 0,
      progress: [],
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ tests for getProgressByStudent
// ════════════════════════════════════════════════════════════════════════════
describe("👤 getProgressByStudent", () => {
  beforeEach(() => jest.clearAllMocks());

  test("student should view own progress by studentId", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const progresses = [buildProgress(student._id, tutor._id)];

    const req = {
      user: student,
      params: { studentId: student._id.toString() },
    };
    const res = buildMockRes();

    Progress.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(progresses),
      }),
    });

    await getProgressByStudent(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 1,
      progress: progresses,
    });
  });

  test("tutor should view their student's progress only", async () => {
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const progresses = [buildProgress(student._id, tutor._id)];

    const req = {
      user: tutor,
      params: { studentId: student._id.toString() },
    };
    const res = buildMockRes();

    Progress.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(progresses),
      }),
    });

    await getProgressByStudent(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 })
    );

    // Verify query included tutor filter
    const findCall = Progress.find.mock.calls[0][0];
    expect(findCall.tutor).toEqual(tutor._id);
  });

  test("admin should view any student's progress", async () => {
    const admin = buildUser("admin");
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const progresses = [buildProgress(student._id, tutor._id)];

    const req = {
      user: admin,
      params: { studentId: student._id.toString() },
    };
    const res = buildMockRes();

    Progress.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(progresses),
      }),
    });

    await getProgressByStudent(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 })
    );
  });

  test("student should NOT view other student's progress", async () => {
    const student1 = buildUser("user");
    const student2 = buildUser("user");
    const req = {
      user: student1,
      params: { studentId: student2._id.toString() },
    };
    const res = buildMockRes();

    await getProgressByStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

  test("should return 400 for invalid studentId", async () => {
    const student = buildUser("user");
    const req = {
      user: student,
      params: { studentId: "invalid-id" },
    };
    const res = buildMockRes();

    await getProgressByStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ tests for getProgressByTutor
// ════════════════════════════════════════════════════════════════════════════
describe("👨‍🏫 getProgressByTutor", () => {
  beforeEach(() => jest.clearAllMocks());

  test("tutor should view own students' progress", async () => {
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const progresses = [buildProgress(student._id, tutor._id)];

    const req = {
      user: tutor,
      params: { tutorId: tutor._id.toString() },
    };
    const res = buildMockRes();

    Progress.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(progresses),
      }),
    });

    await getProgressByTutor(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 1,
      progress: progresses,
    });
  });

  test("admin should view any tutor's students' progress", async () => {
    const admin = buildUser("admin");
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const progresses = [buildProgress(student._id, tutor._id)];

    const req = {
      user: admin,
      params: { tutorId: tutor._id.toString() },
    };
    const res = buildMockRes();

    Progress.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(progresses),
      }),
    });

    await getProgressByTutor(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 })
    );
  });

  test("tutor should NOT view other tutor's students' progress", async () => {
    const tutor1 = buildUser("tutor");
    const tutor2 = buildUser("tutor");
    const req = {
      user: tutor1,
      params: { tutorId: tutor2._id.toString() },
    };
    const res = buildMockRes();

    await getProgressByTutor(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

  test("should return 400 for invalid tutorId", async () => {
    const tutor = buildUser("tutor");
    const req = {
      user: tutor,
      params: { tutorId: "invalid-id" },
    };
    const res = buildMockRes();

    await getProgressByTutor(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ tests for getAllProgress
// ════════════════════════════════════════════════════════════════════════════
describe("📊 getAllProgress", () => {
  beforeEach(() => jest.clearAllMocks());

  test("admin should view all progress records", async () => {
    const admin = buildUser("admin");
    const student1 = buildUser("user");
    const student2 = buildUser("user");
    const tutor = buildUser("tutor");
    const progresses = [
      buildProgress(student1._id, tutor._id),
      buildProgress(student2._id, tutor._id),
    ];

    const req = { user: admin };
    const res = buildMockRes();

    Progress.find = jest.fn().mockReturnValue({
      populate: jest
        .fn()
        .mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(progresses),
          }),
        }),
    });

    await getAllProgress(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 2,
      progress: progresses,
    });
  });

  test("non-admin should NOT view all progress", async () => {
    const student = buildUser("user");
    const req = { user: student };
    const res = buildMockRes();

    await getAllProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Only admins can view all progress records",
      })
    );
  });

  test("tutor should NOT view all progress", async () => {
    const tutor = buildUser("tutor");
    const req = { user: tutor };
    const res = buildMockRes();

    await getAllProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ tests for deleteProgress
// ════════════════════════════════════════════════════════════════════════════
describe("🗑️ deleteProgress", () => {
  beforeEach(() => jest.clearAllMocks());

  test("tutor should delete own student's progress record", async () => {
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const progress = buildProgress(student._id, tutor._id);

    const req = {
      user: tutor,
      params: { id: progress._id.toString() },
    };
    const res = buildMockRes();

    Progress.findById = jest.fn().mockResolvedValue(progress);
    Progress.deleteOne = jest.fn().mockResolvedValue({});

    await deleteProgress(req, res);

    expect(Progress.deleteOne).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Progress record deleted" });
  });

  test("admin should delete any progress record", async () => {
    const admin = buildUser("admin");
    const tutor = buildUser("tutor");
    const student = buildUser("user");
    const progress = buildProgress(student._id, tutor._id);

    const req = {
      user: admin,
      params: { id: progress._id.toString() },
    };
    const res = buildMockRes();

    Progress.findById = jest.fn().mockResolvedValue(progress);
    Progress.deleteOne = jest.fn().mockResolvedValue({});

    await deleteProgress(req, res);

    expect(Progress.deleteOne).toHaveBeenCalled();
  });

  test("tutor should NOT delete another tutor's progress record", async () => {
    const tutor1 = buildUser("tutor");
    const tutor2 = buildUser("tutor");
    const student = buildUser("user");
    const progress = buildProgress(student._id, tutor2._id);

    const req = {
      user: tutor1,
      params: { id: progress._id.toString() },
    };
    const res = buildMockRes();

    Progress.findById = jest.fn().mockResolvedValue(progress);

    await deleteProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

  test("student should NOT delete progress record", async () => {
    const student = buildUser("user");
    const tutor = buildUser("tutor");
    const progress = buildProgress(student._id, tutor._id);

    const req = {
      user: student,
      params: { id: progress._id.toString() },
    };
    const res = buildMockRes();

    Progress.findById = jest.fn().mockResolvedValue(progress);

    await deleteProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
  });

  test("should return 404 for non-existent progress", async () => {
    const tutor = buildUser("tutor");
    const req = {
      user: tutor,
      params: { id: new mongoose.Types.ObjectId().toString() },
    };
    const res = buildMockRes();

    Progress.findById = jest.fn().mockResolvedValue(null);

    await deleteProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      message: "Progress record not found",
    });
  });

  test("should return 400 for invalid progress id", async () => {
    const tutor = buildUser("tutor");
    const req = {
      user: tutor,
      params: { id: "invalid-id" },
    };
    const res = buildMockRes();

    await deleteProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  });
});
