/**
 * INTEGRATION TESTS — Progress Tracking API Endpoints
 * Route: /api/progress
 *
 * Uses:
 *  - Supertest (real HTTP requests against Express app)
 *  - MongoDB Memory Server (isolated in-memory DB)
 *  - Real Mongoose models (no mocks — tests the full stack)
 *
 * Covers:
 *  POST   /api/progress              — upsert progress record
 *  GET    /api/progress/me           — get own progress (student)
 *  GET    /api/progress/student/:id  — get by student (student/tutor/admin)
 *  GET    /api/progress/tutor/:id    — get by tutor (tutor/admin)
 *  GET    /api/progress/admin/all    — get all (admin only)
 *  DELETE /api/progress/:id          — delete progress record
 */

import request from "supertest";
import mongoose from "mongoose";
import { jest } from "@jest/globals";

// ── Mock services ──────────────────────────────────────────────────────────
jest.mock("../../services/feedbackMailService.js", () => ({
  sendFeedbackNotificationEmail: jest.fn(() => Promise.resolve({})),
}));

// Suppress console errors from async email operations
const originalConsoleError = console.error;
console.error = jest.fn((...args) => {
  // Only log critical errors, suppress email/async warnings
  const message = args[0]?.toString?.() || '';
  if (!message.includes('Too many emails') && !message.includes('email') && !message.includes('Cloudinary')) {
    originalConsoleError(...args);
  }
});

jest.mock("../../Middleware/uploadMiddleware.js", () => ({
  cloudinary: {
    uploader: {
      destroy: () => Promise.resolve({ result: "ok" }),
    },
  },
  uploadMaterial: {
    single: (_fieldName) => (req, _res, next) => {
      req.file = {
        path: "https://res.cloudinary.com/demo/raw/upload/v1/study_materials/test_file.pdf",
      };
      next();
    },
  },
  handleUploadError: (_req, _res, next) => next(),
}));

jest.mock("../../services/googleCalendarService.js", () => ({
  initCalendar: jest.fn(),
}));

import * as dbHandler from "../setup/dbHandler.js";
import { generateToken } from "../setup/testHelpers.js";
import User from "../../models/UserModel.js";
import Progress from "../../models/ProgressModel.js";
import app from "../setup/testApp.js";

// ─── DB lifecycle ────────────────────────────────────────────────────────────
beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  // Allow async operations to settle
  await new Promise(resolve => setTimeout(resolve, 100));
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  // Restore original console.error
  console.error = originalConsoleError;
  // Allow async operations to settle before closing
  await new Promise(resolve => setTimeout(resolve, 100));
  await dbHandler.closeDatabase();
});

// ─── Helper to create users ──────────────────────────────────────────────────
const createUser = async (role = "user", overrides = {}) => {
  const user = await User.create({
    fullName: `Test ${role}`,
    email: `${role}${Date.now()}-${Math.random()}@test.com`,
    password: "hashedpass123",
    role,
    ...overrides,
  });
  const token = generateToken({ id: user._id.toString(), role });
  return { user, token };
};

// ════════════════════════════════════════════════════════════════════════════
// ✅ POST /api/progress — Upsert Progress
// ════════════════════════════════════════════════════════════════════════════
describe("POST /api/progress — Upsert Progress", () => {
  test("tutor should upsert student progress with topic", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Algebra",
        completionPercent: 75,
        notes: "Good progress, needs practice",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Progress saved");
    expect(res.body.progress.topic).toBe("Algebra");
    expect(res.body.progress.completionPercent).toBe(75);
    expect(res.body.progress.notes).toBe("Good progress, needs practice");
  });

  test("student should upsert own progress", async () => {
    const { user: student, token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Geometry",
        completionPercent: 50,
      });

    expect(res.status).toBe(200);
    expect(res.body.progress.completionPercent).toBe(50);
  });

  test("progress should update if same student+tutor+topic", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");

    // First upsert
    await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Algebra",
        completionPercent: 50,
      });

    // Second upsert with same key should update
    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Algebra",
        completionPercent: 75,
      });

    expect(res.status).toBe(200);
    expect(res.body.progress.completionPercent).toBe(75);

    // Verify only one record exists
    const count = await Progress.countDocuments({
      student: student._id,
      tutor: tutor._id,
      topic: "Algebra",
    });
    expect(count).toBe(1);
  });

  test("progress should upsert with sessionId", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");
    const sessionId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        sessionId: sessionId.toString(),
        completionPercent: 100,
      });

    expect(res.status).toBe(200);
    expect(res.body.progress.session.toString()).toBe(sessionId.toString());
  });

  test("admin should upsert any progress", async () => {
    const { user: admin, token: adminToken } = await createUser("admin");
    const { user: tutor } = await createUser("tutor");
    const { user: student } = await createUser("user");

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Calculus",
        completionPercent: 85,
      });

    expect(res.status).toBe(200);
  });

  test("should reject invalid studentId", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({
        studentId: "invalid-id",
        tutorId: tutor._id.toString(),
        topic: "Algebra",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Valid studentId is required");
  });

  test("should reject invalid tutorId", async () => {
    const { user: student, token: studentToken } = await createUser("user");

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: "invalid-id",
        topic: "Algebra",
      });

    expect(res.status).toBe(400);
  });

  test("should reject completionPercent < 0", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        completionPercent: -1,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("completionPercent must be 0-100");
  });

  test("should reject completionPercent > 100", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        completionPercent: 101,
      });

    expect(res.status).toBe(400);
  });

  test("tutor should NOT update other tutor's student progress", async () => {
    const { user: tutor1, token: tutor1Token } = await createUser("tutor");
    const { user: tutor2 } = await createUser("tutor");
    const { user: student } = await createUser("user");

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${tutor1Token}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor2._id.toString(),
        topic: "Algebra",
        completionPercent: 50,
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "Tutor can update only their own students' progress"
    );
  });

  test("student should NOT update other student's progress", async () => {
    const { user: student1, token: student1Token } = await createUser("user");
    const { user: student2 } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", `Bearer ${student1Token}`)
      .send({
        studentId: student2._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Algebra",
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Student can update only their own progress");
  });

  test("should require authentication", async () => {
    const { user: student } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const res = await request(app)
      .post("/api/progress")
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        topic: "Algebra",
      });

    expect(res.status).toBe(401);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET /api/progress/me — Get Own Progress
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/progress/me — Get Own Progress", () => {
  test("student should view own progress records", async () => {
    const { user: student, token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    // Create progress records
    await Progress.create({
      student: student._id,
      tutor: tutor._id,
      topic: "Algebra",
      completionPercent: 80,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .get("/api/progress/me")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.progress[0].topic).toBe("Algebra");
  });

  test("student with no progress should return empty", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .get("/api/progress/me")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET /api/progress/student/:studentId — Get by Student
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/progress/student/:studentId — Get by Student", () => {
  test("student should view own progress by studentId", async () => {
    const { user: student, token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    await Progress.create({
      student: student._id,
      tutor: tutor._id,
      topic: "Geometry",
      completionPercent: 60,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .get(`/api/progress/student/${student._id}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test("tutor should view only their own student's progress", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");

    await Progress.create({
      student: student._id,
      tutor: tutor._id,
      topic: "Algebra",
      completionPercent: 75,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .get(`/api/progress/student/${student._id}`)
      .set("Authorization", `Bearer ${tutorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test("tutor should NOT view other tutor's student progress", async () => {
    const { user: tutor1, token: tutor1Token } = await createUser("tutor");
    const { user: tutor2 } = await createUser("tutor");
    const { user: student } = await createUser("user");

    await Progress.create({
      student: student._id,
      tutor: tutor2._id,
      topic: "Algebra",
      completionPercent: 50,
      updatedBy: tutor2._id,
    });

    const res = await request(app)
      .get(`/api/progress/student/${student._id}`)
      .set("Authorization", `Bearer ${tutor1Token}`);

    // Should return empty, not forbidden
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });

  test("admin should view any student's progress", async () => {
    const { user: admin, token: adminToken } = await createUser("admin");
    const { user: tutor } = await createUser("tutor");
    const { user: student } = await createUser("user");

    await Progress.create({
      student: student._id,
      tutor: tutor._id,
      topic: "Calculus",
      completionPercent: 90,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .get(`/api/progress/student/${student._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test("student should NOT view other student's progress", async () => {
    const { user: student1, token: student1Token } = await createUser("user");
    const { user: student2 } = await createUser("user");

    const res = await request(app)
      .get(`/api/progress/student/${student2._id}`)
      .set("Authorization", `Bearer ${student1Token}`);

    expect(res.status).toBe(403);
  });

  test("should reject invalid studentId", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .get("/api/progress/student/invalid-id")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET /api/progress/tutor/:tutorId — Get by Tutor
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/progress/tutor/:tutorId — Get by Tutor", () => {
  test("tutor should view own students' progress", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");

    await Progress.create({
      student: student._id,
      tutor: tutor._id,
      topic: "Physics",
      completionPercent: 70,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .get(`/api/progress/tutor/${tutor._id}`)
      .set("Authorization", `Bearer ${tutorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test("admin should view any tutor's students' progress", async () => {
    const { user: admin, token: adminToken } = await createUser("admin");
    const { user: tutor } = await createUser("tutor");
    const { user: student } = await createUser("user");

    await Progress.create({
      student: student._id,
      tutor: tutor._id,
      topic: "Chemistry",
      completionPercent: 85,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .get(`/api/progress/tutor/${tutor._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test("tutor should NOT view other tutor's students' progress", async () => {
    const { user: tutor1, token: tutor1Token } = await createUser("tutor");
    const { user: tutor2 } = await createUser("tutor");

    const res = await request(app)
      .get(`/api/progress/tutor/${tutor2._id}`)
      .set("Authorization", `Bearer ${tutor1Token}`);

    expect(res.status).toBe(403);
  });

  test("should reject invalid tutorId", async () => {
    const { token: tutorToken } = await createUser("tutor");

    const res = await request(app)
      .get("/api/progress/tutor/invalid-id")
      .set("Authorization", `Bearer ${tutorToken}`);

    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET /api/progress/admin/all — Get All Progress
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/progress/admin/all — Get All Progress", () => {
  test("admin should view all progress records", async () => {
    const { user: admin, token: adminToken } = await createUser("admin");
    const { user: tutor } = await createUser("tutor");
    const { user: student1 } = await createUser("user");
    const { user: student2 } = await createUser("user");

    await Progress.create({
      student: student1._id,
      tutor: tutor._id,
      topic: "Algebra",
      completionPercent: 80,
      updatedBy: tutor._id,
    });
    await Progress.create({
      student: student2._id,
      tutor: tutor._id,
      topic: "Geometry",
      completionPercent: 70,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .get("/api/progress/admin/all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  test("non-admin should NOT view all progress", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .get("/api/progress/admin/all")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Only admins can view all progress records");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ DELETE /api/progress/:id — Delete Progress
// ════════════════════════════════════════════════════════════════════════════
describe("DELETE /api/progress/:id — Delete Progress", () => {
  test("tutor should delete own student's progress record", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");

    const progress = await Progress.create({
      student: student._id,
      tutor: tutor._id,
      topic: "Algebra",
      completionPercent: 50,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .delete(`/api/progress/${progress._id}`)
      .set("Authorization", `Bearer ${tutorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Progress record deleted");

    const deleted = await Progress.findById(progress._id);
    expect(deleted).toBeNull();
  });

  test("admin should delete any progress record", async () => {
    const { user: admin, token: adminToken } = await createUser("admin");
    const { user: tutor } = await createUser("tutor");
    const { user: student } = await createUser("user");

    const progress = await Progress.create({
      student: student._id,
      tutor: tutor._id,
      topic: "Geometry",
      completionPercent: 75,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .delete(`/api/progress/${progress._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  test("tutor should NOT delete other tutor's progress record", async () => {
    const { user: tutor1, token: tutor1Token } = await createUser("tutor");
    const { user: tutor2 } = await createUser("tutor");
    const { user: student } = await createUser("user");

    const progress = await Progress.create({
      student: student._id,
      tutor: tutor2._id,
      topic: "Algebra",
      completionPercent: 50,
      updatedBy: tutor2._id,
    });

    const res = await request(app)
      .delete(`/api/progress/${progress._id}`)
      .set("Authorization", `Bearer ${tutor1Token}`);

    expect(res.status).toBe(403);
  });

  test("student should NOT delete progress record", async () => {
    const { user: student, token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const progress = await Progress.create({
      student: student._id,
      tutor: tutor._id,
      topic: "Physics",
      completionPercent: 60,
      updatedBy: tutor._id,
    });

    const res = await request(app)
      .delete(`/api/progress/${progress._id}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });

  test("should return 404 for non-existent progress", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");

    const res = await request(app)
      .delete(`/api/progress/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${tutorToken}`);

    expect(res.status).toBe(404);
  });

  test("should return 400 for invalid progress id", async () => {
    const { token: tutorToken } = await createUser("tutor");

    const res = await request(app)
      .delete("/api/progress/invalid-id")
      .set("Authorization", `Bearer ${tutorToken}`);

    expect(res.status).toBe(400);
  });
});
