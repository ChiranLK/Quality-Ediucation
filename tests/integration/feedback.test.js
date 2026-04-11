/**
 * INTEGRATION TESTS — Feedback API Endpoints
 * Route: /api/feedbacks
 *
 * Uses:
 *  - Supertest (real HTTP requests against Express app)
 *  - MongoDB Memory Server (isolated in-memory DB)
 *  - Real Mongoose models (no mocks — tests the full stack)
 *
 * Covers:
 *  POST   /api/feedbacks              — submit feedback (student/admin, auth required)
 *  GET    /api/feedbacks              — get all (admin only)
 *  GET    /api/feedbacks/me           — get own submitted feedbacks (student)
 *  GET    /api/feedbacks/tutor/:id/ratings — get rating stats
 *  GET    /api/feedbacks/tutor/:id    — get tutor's feedback list (tutor/admin)
 *  PUT    /api/feedbacks/admin/:id    — update feedback (admin)
 *  POST   /api/feedbacks/admin/create — admin create feedback
 *  DELETE /api/feedbacks/:id          — delete feedback
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

// ── Mock Cloudinary so no real file uploads happen ──────────────────────────
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
import Feedback from "../../models/FeedbackModel.js";
import app from "../setup/testApp.js";

// ─── DB lifecycle ────────────────────────────────────────────────────────────
beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  // Allow async operations (like email sending) to settle
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
// ✅ POST /api/feedbacks — Submit Feedback
// ════════════════════════════════════════════════════════════════════════════
describe("POST /api/feedbacks — Submit Feedback", () => {
  test("student should submit feedback to tutor", async () => {
    const { user: student, token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const res = await request(app)
      .post("/api/feedbacks")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        tutorId: tutor._id.toString(),
        rating: 5,
        message: "Excellent tutor!",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Feedback saved");
    expect(res.body).toHaveProperty("feedback");
    expect(res.body.feedback.rating).toBe(5);
    expect(res.body.feedback.message).toBe("Excellent tutor!");

    // Verify tutor rating was updated
    const updatedTutor = await User.findById(tutor._id);
    expect(updatedTutor.tutorProfile.rating.count).toBe(1);
    expect(updatedTutor.tutorProfile.rating.average).toBe(5);
  });

  test("student should submit feedback with sessionId", async () => {
    const { user: student, token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const res = await request(app)
      .post("/api/feedbacks")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        tutorId: tutor._id.toString(),
        rating: 4,
        message: "Good session",
        sessionId: new mongoose.Types.ObjectId().toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.feedback.rating).toBe(4);
  });

  test("tutor should NOT submit feedback (role mismatch)", async () => {
    const { token: tutorToken } = await createUser("tutor");
    const { user: targetTutor } = await createUser("tutor");

    const res = await request(app)
      .post("/api/feedbacks")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({
        tutorId: targetTutor._id.toString(),
        rating: 5,
        message: "feedback",
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Only students can submit feedback");
  });

  test("should reject invalid rating (< 1)", async () => {
    const { token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const res = await request(app)
      .post("/api/feedbacks")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        tutorId: tutor._id.toString(),
        rating: 0,
        message: "feedback",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("rating must be between 1 and 5");
  });

  test("should reject invalid rating (> 5)", async () => {
    const { token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const res = await request(app)
      .post("/api/feedbacks")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        tutorId: tutor._id.toString(),
        rating: 6,
        message: "feedback",
      });

    expect(res.status).toBe(400);
  });

  test("should reject missing tutorId", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .post("/api/feedbacks")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        rating: 5,
        message: "feedback",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Valid tutorId is required");
  });

  test("should reject invalid tutorId", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .post("/api/feedbacks")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        tutorId: "invalid-id",
        rating: 5,
        message: "feedback",
      });

    expect(res.status).toBe(400);
  });

  test("should reject feedback for non-existent tutor", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .post("/api/feedbacks")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        tutorId: new mongoose.Types.ObjectId().toString(),
        rating: 5,
        message: "feedback",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Tutor not found");
  });

  test("should require authentication", async () => {
    const { user: tutor } = await createUser("tutor");

    const res = await request(app)
      .post("/api/feedbacks")
      .send({
        tutorId: tutor._id.toString(),
        rating: 5,
        message: "feedback",
      });

    expect(res.status).toBe(401);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET /api/feedbacks/me — Get Own Feedbacks
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/feedbacks/me — Get Own Feedbacks", () => {
  test("student should view own submitted feedbacks", async () => {
    const { user: student, token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    // Create feedback
    await Feedback.create({
      student: student._id,
      tutor: tutor._id,
      rating: 5,
      message: "Great!",
    });

    const res = await request(app)
      .get("/api/feedbacks/me")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.feedbacks).toHaveLength(1);
    expect(res.body.feedbacks[0].rating).toBe(5);
  });

  test("student with no feedbacks should return empty", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .get("/api/feedbacks/me")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.feedbacks).toHaveLength(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET /api/feedbacks/tutor/:tutorId/ratings — Get Rating Stats
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/feedbacks/tutor/:tutorId/ratings — Get Rating Stats", () => {
  test("anyone can view tutor rating statistics", async () => {
    const { user: tutor } = await createUser("tutor");
    const { token: studentToken } = await createUser("user");

    // Create multiple feedbacks with different ratings
    await Feedback.create({
      student: new mongoose.Types.ObjectId(),
      tutor: tutor._id,
      rating: 5,
    });
    await Feedback.create({
      student: new mongoose.Types.ObjectId(),
      tutor: tutor._id,
      rating: 4,
    });

    const res = await request(app)
      .get(`/api/feedbacks/tutor/${tutor._id}/ratings`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalRatings).toBe(2);
    expect(res.body.avgRating).toBe(4.5);
    expect(res.body.breakdown[5]).toBe(1);
    expect(res.body.breakdown[4]).toBe(1);
  });

  test("tutor with no feedbacks should return zero stats", async () => {
    const { user: tutor } = await createUser("tutor");
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .get(`/api/feedbacks/tutor/${tutor._id}/ratings`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalRatings).toBe(0);
    expect(res.body.avgRating).toBe(0);
  });

  test("should reject invalid tutorId", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .get("/api/feedbacks/tutor/invalid-id/ratings")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET /api/feedbacks/tutor/:tutorId — Get Tutor Feedbacks
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/feedbacks/tutor/:tutorId — Get Tutor Feedbacks", () => {
  test("tutor should view feedback list about self", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");

    await Feedback.create({
      student: student._id,
      tutor: tutor._id,
      rating: 5,
      message: "Excellent!",
    });

    const res = await request(app)
      .get(`/api/feedbacks/tutor/${tutor._id}`)
      .set("Authorization", `Bearer ${tutorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.feedbacks[0].rating).toBe(5);
  });

  test("admin should view any tutor's feedback", async () => {
    const { user: tutor } = await createUser("tutor");
    const { user: student } = await createUser("user");
    const { token: adminToken } = await createUser("admin");

    await Feedback.create({
      student: student._id,
      tutor: tutor._id,
      rating: 4,
    });

    const res = await request(app)
      .get(`/api/feedbacks/tutor/${tutor._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test("other tutor should NOT view another tutor's feedback", async () => {
    const { user: tutor1 } = await createUser("tutor");
    const { user: tutor2 } = await createUser("tutor");
    const { token: tutor2Token } = {
      user: tutor2,
      token: generateToken({ id: tutor2._id.toString(), role: "tutor" }),
    };

    const res = await request(app)
      .get(`/api/feedbacks/tutor/${tutor1._id}`)
      .set("Authorization", `Bearer ${tutor2Token}`);

    expect(res.status).toBe(403);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET /api/feedbacks — Get All Feedbacks
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/feedbacks — Get All Feedbacks", () => {
  test("admin should view all feedbacks", async () => {
    const { user: student1 } = await createUser("user");
    const { user: student2 } = await createUser("user");
    const { user: tutor } = await createUser("tutor");
    const { token: adminToken } = await createUser("admin");

    await Feedback.create({
      student: student1._id,
      tutor: tutor._id,
      rating: 5,
    });
    await Feedback.create({
      student: student2._id,
      tutor: tutor._id,
      rating: 4,
    });

    const res = await request(app)
      .get("/api/feedbacks")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
  });

  test("non-admin should NOT view all feedbacks", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .get("/api/feedbacks")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ DELETE /api/feedbacks/:id — Delete Feedback
// ════════════════════════════════════════════════════════════════════════════
describe("DELETE /api/feedbacks/:id — Delete Feedback", () => {
  test("student should delete own feedback", async () => {
    const { user: student, token: studentToken } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const feedback = await Feedback.create({
      student: student._id,
      tutor: tutor._id,
      rating: 5,
    });

    const res = await request(app)
      .delete(`/api/feedbacks/${feedback._id}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Feedback deleted");

    const deleted = await Feedback.findById(feedback._id);
    expect(deleted).toBeNull();
  });

  test("tutor should delete feedback about self", async () => {
    const { user: tutor, token: tutorToken } = await createUser("tutor");
    const { user: student } = await createUser("user");

    const feedback = await Feedback.create({
      student: student._id,
      tutor: tutor._id,
      rating: 3,
    });

    const res = await request(app)
      .delete(`/api/feedbacks/${feedback._id}`)
      .set("Authorization", `Bearer ${tutorToken}`);

    expect(res.status).toBe(200);
  });

  test("other student should NOT delete feedback", async () => {
    const { user: student1 } = await createUser("user");
    const { user: student2, token: student2Token } = await createUser("user");
    const { user: tutor } = await createUser("tutor");

    const feedback = await Feedback.create({
      student: student1._id,
      tutor: tutor._id,
      rating: 5,
    });

    const res = await request(app)
      .delete(`/api/feedbacks/${feedback._id}`)
      .set("Authorization", `Bearer ${student2Token}`);

    expect(res.status).toBe(403);
  });

  test("should return 404 for non-existent feedback", async () => {
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .delete(`/api/feedbacks/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(404);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ POST /api/feedbacks/admin/create — Admin Create Feedback
// ════════════════════════════════════════════════════════════════════════════
describe("POST /api/feedbacks/admin/create — Admin Create Feedback", () => {
  test("admin should create feedback on behalf of student", async () => {
    const { user: student } = await createUser("user");
    const { user: tutor } = await createUser("tutor");
    const { token: adminToken } = await createUser("admin");

    const res = await request(app)
      .post("/api/feedbacks/admin/create")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        rating: 5,
        message: "Admin created feedback",
      });

    expect(res.status).toBe(201);
    expect(res.body.feedback.rating).toBe(5);

    // Verify tutor rating updated
    const updatedTutor = await User.findById(tutor._id);
    expect(updatedTutor.tutorProfile.rating.count).toBe(1);
  });

  test("non-admin should NOT create feedback", async () => {
    const { user: student } = await createUser("user");
    const { user: tutor } = await createUser("tutor");
    const { token: studentToken } = await createUser("user");

    const res = await request(app)
      .post("/api/feedbacks/admin/create")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        studentId: student._id.toString(),
        tutorId: tutor._id.toString(),
        rating: 5,
      });

    expect(res.status).toBe(403);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ PUT /api/feedbacks/admin/:id — Update Feedback
// ════════════════════════════════════════════════════════════════════════════
describe("PUT /api/feedbacks/admin/:id — Update Feedback", () => {
  test("admin should update feedback rating and message", async () => {
    const { user: student } = await createUser("user");
    const { user: tutor } = await createUser("tutor");
    const { token: adminToken } = await createUser("admin");

    const feedback = await Feedback.create({
      student: student._id,
      tutor: tutor._id,
      rating: 3,
      message: "Original message",
    });

    const res = await request(app)
      .put(`/api/feedbacks/admin/${feedback._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        rating: 5,
        message: "Updated message",
      });

    expect(res.status).toBe(200);
    expect(res.body.feedback.rating).toBe(5);
    expect(res.body.feedback.message).toBe("Updated message");
  });

  test("non-admin should NOT update feedback", async () => {
    const { user: student } = await createUser("user");
    const { user: tutor } = await createUser("tutor");
    const { token: studentToken } = await createUser("user");

    const feedback = await Feedback.create({
      student: student._id,
      tutor: tutor._id,
      rating: 3,
    });

    const res = await request(app)
      .put(`/api/feedbacks/admin/${feedback._id}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ rating: 5 });

    expect(res.status).toBe(403);
  });

  test("should reject invalid rating", async () => {
    const { user: student } = await createUser("user");
    const { user: tutor } = await createUser("tutor");
    const { token: adminToken } = await createUser("admin");

    const feedback = await Feedback.create({
      student: student._id,
      tutor: tutor._id,
      rating: 3,
    });

    const res = await request(app)
      .put(`/api/feedbacks/admin/${feedback._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ rating: 6 });

    expect(res.status).toBe(400);
  });
});
