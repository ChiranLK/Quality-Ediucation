// Set test environment variables BEFORE any modules are imported
// This ensures JWT_SECRET is available to auth middleware during tests
process.env.JWT_SECRET = "test_secret_key_12345";
process.env.NODE_ENV = "test";

/**
 * INTEGRATION TESTS — Study Material API Endpoints
 * Route: /api/materials
 *
 * Uses:
 *  - Supertest (real HTTP requests against Express app)
 *  - MongoDB Memory Server (isolated in-memory DB)
 *  - Real Mongoose models (no mocks — tests the full stack)
 *
 * Covers:
 *  POST   /api/materials           — create (tutor/admin, auth required)
 *  GET    /api/materials           — list all with pagination
 *  GET    /api/materials/my        — get uploader's own materials
 *  GET    /api/materials/:id       — get single + view count increment
 *  PATCH  /api/materials/:id       — update (owner or admin)
 *  DELETE /api/materials/:id       — delete (owner or admin)
 *  POST   /api/materials/:id/like  — toggle like
 *  POST   /api/materials/:id/download — increment downloads
 */

import request from "supertest";
import mongoose from "mongoose";
import { jest } from "@jest/globals";

// ── Mock Cloudinary so no real file uploads happen ──────────────────────────
jest.mock("../../Middleware/uploadMiddleware.js", () => ({
  cloudinary: {
    uploader: {
      destroy: () => Promise.resolve({ result: "ok" }),
    },
  },
  uploadMaterial: {
    // Return a middleware that injects a fake req.file (simulates successful Cloudinary upload)
    single: (_fieldName) => (req, _res, next) => {
      req.file = {
        path: "https://res.cloudinary.com/demo/raw/upload/v1/study_materials/test_file.pdf",
        originalname: "test.pdf",
        mimetype: "application/pdf",
        size: 12345,
      };
      next();
    },
  },
  handleUploadError: (_req, _res, next) => next(),
}));

// ── Mock Google Calendar (side-effect in server.js) ─────────────────────────
jest.mock("../../services/googleCalendarService.js", () => ({
  initCalendar: jest.fn(),
}));

import * as dbHandler from "../setup/dbHandler.js";
import { buildMaterialPayload } from "../setup/testHelpers.js";
import User from "../../models/UserModel.js";
import StudyMaterial from "../../models/StudyMaterialModel.js";
import app from "../setup/testApp.js";

// ─── DB lifecycle ────────────────────────────────────────────────────────────
beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  // Allow async operations to settle before clearing
  await new Promise(resolve => setTimeout(resolve, 50));
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

// ─── Seed helpers ────────────────────────────────────────────────────────────

/**
 * Creates a real User doc in the in-memory DB and returns the user + JWT token.
 * The token is signed with the real user's _id so protect middleware can find them.
 * NOTE: UserModel roles are "user" | "admin" | "tutor" — no "student" role.
 */
import jwt from "jsonwebtoken";

const seedUser = async (role = "tutor") => {
  const user = await User.create({
    fullName: `Test ${role}`,
    email: `${role}${Date.now()}@test.com`,
    password: "hashedpassword123",
    role,
  });
  // Sign with the real user._id so protect() can find them in the DB
  const token = jwt.sign(
    { id: user._id.toString(), role },
    process.env.JWT_SECRET || "test_secret_key_12345",
    { expiresIn: "1d" }
  );
  return { user, token };
};

/**
 * Creates a real StudyMaterial doc and returns it.
 */
const seedMaterial = async (uploaderId, overrides = {}) => {
  return StudyMaterial.create({
    ...buildMaterialPayload(overrides),
    uploadedBy: uploaderId,
  });
};

// ════════════════════════════════════════════════════════════════════════════
//  POST /api/materials — Create Study Material
// ════════════════════════════════════════════════════════════════════════════
describe("POST /api/materials", () => {
  // ✅ Success — tutor creates a material
  test("201: tutor can create a new study material", async () => {
    const { token } = await seedUser("tutor");

    const res = await request(app)
      .post("/api/materials")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Introduction to Algebra",
        description: "A comprehensive guide to basic algebra concepts.",
        subject: "mathematics",
        grade: "10th",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Introduction to Algebra");
    expect(res.body.data.subject).toBe("mathematics");
  });

  // ✅ Success — admin creates a material
  test("201: admin can create a new study material", async () => {
    const { token } = await seedUser("admin");

    const res = await request(app)
      .post("/api/materials")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Physics Fundamentals",
        description: "Basic physics principles for high school students.",
        subject: "physics",
        grade: "11th",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.subject).toBe("physics");
  });

  // ❌ Error — regular user cannot create (403 Forbidden)
  test("403: regular user cannot upload a study material", async () => {
    const { token } = await seedUser("user");

    const res = await request(app)
      .post("/api/materials")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Some Material",
        description: "Some description for this material.",
        subject: "biology",
        grade: "9th",
      });

    expect(res.status).toBe(403);
  });

  // ❌ Error — unauthenticated (401)
  test("401: request without token is rejected", async () => {
    const res = await request(app)
      .post("/api/materials")
      .send({
        title: "No Auth Material",
        description: "This should fail without a token.",
        subject: "chemistry",
        grade: "12th",
      });

    expect(res.status).toBe(401);
  });

  // ❌ Error — missing required fields (400)
  test("400: returns error when title is missing", async () => {
    const { token } = await seedUser("tutor");

    const res = await request(app)
      .post("/api/materials")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Missing title field test case here.",
        subject: "mathematics",
        grade: "10th",
      });

    expect(res.status).toBe(400);
  });

  // 🔲 Edge case — duplicate title + subject
  test("400: cannot create duplicate title + subject combination", async () => {
    const { user, token } = await seedUser("tutor");
    await seedMaterial(user._id, {
      title: "Introduction to Algebra",
      subject: "mathematics",
    });

    const res = await request(app)
      .post("/api/materials")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Introduction to Algebra",
        description: "A duplicate material creation attempt.",
        subject: "mathematics",
        grade: "10th",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /api/materials — List All Materials
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/materials", () => {
  // ✅ Success — returns paginated list
  test("200: returns list of materials with pagination metadata", async () => {
    const { user, token } = await seedUser("tutor");
    await seedMaterial(user._id, { title: "Algebra Basics" });
    await seedMaterial(user._id, { title: "Geometry Fundamentals", subject: "geometry" });

    const res = await request(app)
      .get("/api/materials")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(2);
  });

  // ✅ Filtering by subject
  test("200: filters materials by subject query param", async () => {
    const { user, token } = await seedUser("tutor");
    await seedMaterial(user._id, { title: "Math Basics", subject: "mathematics" });
    await seedMaterial(user._id, { title: "Physics Start", subject: "physics" });

    const res = await request(app)
      .get("/api/materials?subject=mathematics")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].subject).toBe("mathematics");
  });

  // ✅ Pagination — page & limit
  test("200: respects page and limit query params", async () => {
    const { user, token } = await seedUser("tutor");
    await seedMaterial(user._id, { title: "Material One" });
    await seedMaterial(user._id, { title: "Material Two", subject: "physics" });
    await seedMaterial(user._id, { title: "Material Three", subject: "biology" });

    const res = await request(app)
      .get("/api/materials?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.pages).toBe(2);
  });

  // ❌ Error — unauthenticated
  test("401: returns 401 without authorization token", async () => {
    const res = await request(app).get("/api/materials");
    expect(res.status).toBe(401);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /api/materials/my — Get My Materials
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/materials/my", () => {
  // ✅ Success — returns only uploader's materials
  test("200: returns only materials uploaded by the logged-in tutor", async () => {
    const { user: tutor1, token: token1 } = await seedUser("tutor");
    const { user: tutor2 } = await seedUser("tutor");

    await seedMaterial(tutor1._id, { title: "Tutor1 Material" });
    await seedMaterial(tutor2._id, { title: "Tutor2 Material", subject: "physics" });

    const res = await request(app)
      .get("/api/materials/my")
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Tutor1 Material");
  });

  // ❌ Error — regular user cannot access (403)
  test("403: regular user is forbidden from accessing /my route", async () => {
    const { token } = await seedUser("user");

    const res = await request(app)
      .get("/api/materials/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  GET /api/materials/:id — Get Single Material
// ════════════════════════════════════════════════════════════════════════════
describe("GET /api/materials/:id", () => {
  // ✅ Success — returns material and increments view count
  test("200: returns material and increments view count by 1", async () => {
    const { user, token } = await seedUser("tutor");
    const material = await seedMaterial(user._id);

    const res = await request(app)
      .get(`/api/materials/${material._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(material.title);
    expect(res.body.data.metrics.views).toBe(1); // incremented from 0
  });

  // ❌ Error — not found (404)
  test("404: returns 404 for a non-existent material ID", async () => {
    const { token } = await seedUser("tutor");
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/materials/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // ❌ Error — invalid ObjectId (400)
  test("400: returns 400 for an invalid MongoDB ObjectId", async () => {
    const { token } = await seedUser("tutor");

    const res = await request(app)
      .get("/api/materials/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  PATCH /api/materials/:id — Update Material
// ════════════════════════════════════════════════════════════════════════════
describe("PATCH /api/materials/:id", () => {
  // ✅ Success — owner updates their material
  test("200: owner can update their own material", async () => {
    const { user, token } = await seedUser("tutor");
    const material = await seedMaterial(user._id);

    const res = await request(app)
      .patch(`/api/materials/${material._id}`)
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Updated Algebra Guide");

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated Algebra Guide");
  });

  // ✅ Success — admin updates any material
  test("200: admin can update any material", async () => {
    const { user: tutor } = await seedUser("tutor");
    const { token: adminToken } = await seedUser("admin");
    const material = await seedMaterial(tutor._id);

    const res = await request(app)
      .patch(`/api/materials/${material._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("grade", "12th");

    expect(res.status).toBe(200);
    expect(res.body.data.grade).toBe("12th");
  });

  // ❌ Error — another tutor cannot update (403)
  test("403: non-owner tutor cannot update another tutor's material", async () => {
    const { user: tutor1 } = await seedUser("tutor");
    const { token: tutor2Token } = await seedUser("tutor");
    const material = await seedMaterial(tutor1._id);

    const res = await request(app)
      .patch(`/api/materials/${material._id}`)
      .set("Authorization", `Bearer ${tutor2Token}`)
      .field("title", "Should Not Work");

    expect(res.status).toBe(403);
  });

  // ❌ Error — invalid validation (400) — title too short
  test("400: returns validation error when title is too short (< 3 chars)", async () => {
    const { user, token } = await seedUser("tutor");
    const material = await seedMaterial(user._id);

    const res = await request(app)
      .patch(`/api/materials/${material._id}`)
      .set("Authorization", `Bearer ${token}`)
      .field("title", "AB"); // below minlength of 3

    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  DELETE /api/materials/:id — Delete Material
// ════════════════════════════════════════════════════════════════════════════
describe("DELETE /api/materials/:id", () => {
  // ✅ Success — owner deletes their own material
  test("200: owner can delete their own material", async () => {
    const { user, token } = await seedUser("tutor");
    const material = await seedMaterial(user._id);

    const res = await request(app)
      .delete(`/api/materials/${material._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);

    // Verify it is actually gone from the DB
    const deleted = await StudyMaterial.findById(material._id);
    expect(deleted).toBeNull();
  });

  // ✅ Success — admin deletes any material
  test("200: admin can delete any tutor's material", async () => {
    const { user: tutor } = await seedUser("tutor");
    const { token: adminToken } = await seedUser("admin");
    const material = await seedMaterial(tutor._id);

    const res = await request(app)
      .delete(`/api/materials/${material._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  // ❌ Error — another tutor cannot delete (403)
  test("403: non-owner tutor cannot delete another tutor's material", async () => {
    const { user: tutor1 } = await seedUser("tutor");
    const { token: tutor2Token } = await seedUser("tutor");
    const material = await seedMaterial(tutor1._id);

    const res = await request(app)
      .delete(`/api/materials/${material._id}`)
      .set("Authorization", `Bearer ${tutor2Token}`);

    expect(res.status).toBe(403);
  });

  // ❌ Error — not found (404)
  test("404: returns 404 for a non-existent material ID", async () => {
    const { token } = await seedUser("tutor");
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/materials/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /api/materials/:id/like — Toggle Like
// ════════════════════════════════════════════════════════════════════════════
describe("POST /api/materials/:id/like", () => {
  // ✅ Success — like a material
  test("200: user can like a material (like count increases by 1)", async () => {
    const { user: tutor } = await seedUser("tutor");
    const { token: userToken } = await seedUser("user");
    const material = await seedMaterial(tutor._id);

    const res = await request(app)
      .post(`/api/materials/${material._id}/like`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.likes).toBe(1);
    expect(res.body.message).toMatch(/liked/i);
  });

  // 🔲 Edge case — liking twice should unlike (toggle)
  test("200: liking twice toggles to unlike (likes returns to 0)", async () => {
    const { user: tutor } = await seedUser("tutor");
    const { token: userToken } = await seedUser("user");
    const material = await seedMaterial(tutor._id);

    // Like
    await request(app)
      .post(`/api/materials/${material._id}/like`)
      .set("Authorization", `Bearer ${userToken}`);

    // Unlike
    const res = await request(app)
      .post(`/api/materials/${material._id}/like`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.likes).toBe(0);
    expect(res.body.message).toMatch(/unliked/i);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /api/materials/:id/download — Increment Downloads
// ════════════════════════════════════════════════════════════════════════════
describe("POST /api/materials/:id/download", () => {
  // ✅ Success
  test("200: increments download count by 1", async () => {
    const { user: tutor } = await seedUser("tutor");
    const { token: userToken } = await seedUser("user");
    const material = await seedMaterial(tutor._id);

    const res = await request(app)
      .post(`/api/materials/${material._id}/download`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.downloads).toBe(1);
  });

  // ❌ Error — invalid ID
  test("400: returns 400 for an invalid material ID", async () => {
    const { token } = await seedUser("user");

    const res = await request(app)
      .post("/api/materials/invalid-id/download")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
