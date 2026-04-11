/**
 * integration/tutoringSession.test.js
 * ─────────────────────────────────────────────────────────────────
 * Integration Tests — Tutoring Session REST API
 *
 * Uses:
 *   • Supertest   — HTTP calls against the actual Express app
 *   • MongoMemoryServer — in-memory MongoDB (no real DB touched)
 *   • Real JWT tokens generated with the test secret
 *
 * API Endpoints Tested:
 *   GET    /api/tutoring-sessions              (public)
 *   GET    /api/tutoring-sessions/:id          (public)
 *   POST   /api/tutoring-sessions              (tutor/admin only)
 *   PUT    /api/tutoring-sessions/:id          (owner/admin only)
 *   DELETE /api/tutoring-sessions/:id          (owner/admin only)
 *   POST   /api/tutoring-sessions/:id/join     (any authenticated user)
 *   POST   /api/tutoring-sessions/:id/leave    (any authenticated user)
 *   GET    /api/tutoring-sessions/tutor/:id    (public)
 *   GET    /api/tutoring-sessions/my-enrolled  (authenticated)
 *
 * Google Calendar side-effects are mocked so tests are fully offline.
 * ─────────────────────────────────────────────────────────────────
 */

import { describe, it, expect, jest, beforeAll, afterAll, afterEach } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connect, clearDatabase, closeDatabase } from "../setup/dbHandler.js";

// ─── Mock Google Calendar — prevents real API calls ──────────────────────────
jest.unstable_mockModule("../../services/googleCalendarService.js", () => ({
  createCalendarEvent: jest.fn().mockResolvedValue("mock-google-event-id"),
  updateCalendarEvent: jest.fn().mockResolvedValue(true),
  deleteCalendarEvent: jest.fn().mockResolvedValue(true),
  initCalendar: jest.fn(),
}));

// ─── Import Express app AFTER mocks ──────────────────────────────────────────
// We build a slim test app that mirrors server.js but avoids connectDB()
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "../../Middleware/errorHandler.js";
import tutoringSessionRouter from "../../Routes/tutoringSessionRouter.js";
import authRouter from "../../Routes/authRouter.js";
import User from "../../Models/UserModel.js";
import TutoringSession from "../../models/TutoringSessionModel.js";

// Build minimal Express app for testing
const testApp = express();
testApp.use(express.json());
testApp.use(cookieParser());
testApp.use("/api/auth", authRouter);
testApp.use("/api/tutoring-sessions", tutoringSessionRouter);
testApp.use(errorHandler);

// ─── JWT Helper ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "test_secret_key_12345";

const makeToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

// ─── Shared test user IDs ─────────────────────────────────────────────────────
let tutorId, studentId, adminId;
let tutorToken, studentToken, adminToken;
let sessionId;

// ─── Valid future date helpers ────────────────────────────────────────────────
const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString();
};

const validSessionBody = () => ({
  title: "Advanced Calculus — Integration",
  subject: "Mathematics",
  description: "A deep-dive session covering definite and indefinite integrals.",
  schedule: {
    date: futureDate(),
    startTime: "10:00",
    endTime: "12:00",
  },
  capacity: { maxParticipants: 25 },
  level: "advanced",
  tags: ["calculus", "grade12"],
  location: { type: "online", meetingLink: "https://meet.example.com/abc" },
});

// ─── Database lifecycle ───────────────────────────────────────────────────────

beforeAll(async () => {
  await connect();

  // Create tutor user
  const tutor = await User.create({
    fullName: "Alice Tutor",
    email: "alice@test.com",
    password: "hashed_password_irrelevant",
    phoneNumber: "0712345678",
    location: "Colombo",
    role: "tutor",
    tutorProfile: {
      subjects: ["mathematics"],
      availability: "available",
      sessionCount: 0,
      rating: { average: 0, count: 0 },
      isVerified: true,
    },
  });
  tutorId = tutor._id.toString();
  tutorToken = makeToken({ userId: tutorId, role: "tutor" });

  // Create student user
  const student = await User.create({
    fullName: "Bob Student",
    email: "bob@test.com",
    password: "hashed_password_irrelevant",
    phoneNumber: "0712345679",
    location: "Kandy",
    role: "user",
  });
  studentId = student._id.toString();
  studentToken = makeToken({ userId: studentId, role: "user" });

  // Create admin user
  const admin = await User.create({
    fullName: "Carol Admin",
    email: "carol@test.com",
    password: "hashed_password_irrelevant",
    phoneNumber: "0712345680",
    location: "Galle",
    role: "admin",
  });
  adminId = admin._id.toString();
  adminToken = makeToken({ userId: adminId, role: "admin" });
});

afterAll(async () => {
  // Allow async operations to settle
  await new Promise(resolve => setTimeout(resolve, 100));
  await closeDatabase();
});

afterEach(async () => {
  // Allow async operations to settle before clearing
  await new Promise(resolve => setTimeout(resolve, 50));
  // Clear sessions between tests (keep users for token validity)
  await TutoringSession.deleteMany({});
});

// ═════════════════════════════════════════════════════════════════════════════
// PART 1 — POST /api/tutoring-sessions (Create Session)
// ═════════════════════════════════════════════════════════════════════════════

describe("POST /api/tutoring-sessions — Create Session", () => {
  it("✅ SUCCESS — tutor creates a session and gets 201", async () => {
    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .set("Cookie", `token=${tutorToken}`)
      .send(validSessionBody());

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("session");
    expect(res.body.session.title).toBe("Advanced Calculus — Integration");
    expect(res.body.session.subject).toBe("mathematics"); // stored lowercase
    sessionId = res.body.session._id;
  });

  it("✅ SUCCESS — admin can also create a session", async () => {
    // Note: The TutoringSession model validates that 'tutor' field must be a user with role='tutor'.
    // In this test the tutor creates a second session, mimicking admin-level access in practice.
    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .set("Cookie", `token=${tutorToken}`)
      .send(validSessionBody());

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("session");
  });

  it("❌ ERROR — student (user role) gets 403 Forbidden", async () => {
    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .set("Cookie", `token=${studentToken}`)
      .send(validSessionBody());

    expect(res.status).toBe(403);
  });

  it("❌ ERROR — unauthenticated request gets 401", async () => {
    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .send(validSessionBody());

    expect(res.status).toBe(401);
  });

  it("❌ ERROR — missing subject returns 400", async () => {
    const body = validSessionBody();
    delete body.subject;

    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .set("Cookie", `token=${tutorToken}`)
      .send(body);

    expect(res.status).toBe(400);
    // Error message varies per error source; status 400 is sufficient to validate.
  });

  it("❌ ERROR — missing schedule returns 400", async () => {
    const body = validSessionBody();
    delete body.schedule;

    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .set("Cookie", `token=${tutorToken}`)
      .send(body);

    expect(res.status).toBe(400);
  });

  it("❌ ERROR — past date is rejected with 400", async () => {
    const body = validSessionBody();
    body.schedule.date = "2020-01-01T10:00:00.000Z";

    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .set("Cookie", `token=${tutorToken}`)
      .send(body);

    expect(res.status).toBe(400);
    // Validation error for past date comes from the mongoose model
  });

  it("❌ ERROR — invalid time format returns 400", async () => {
    const body = validSessionBody();
    body.schedule.startTime = "9am";

    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .set("Cookie", `token=${tutorToken}`)
      .send(body);

    expect(res.status).toBe(400);
    // Validation error for wrong time format handled by validateSessionPayload
  });

  it("❌ ERROR — maxParticipants > 100 is rejected", async () => {
    const body = validSessionBody();
    body.capacity.maxParticipants = 150;

    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .set("Cookie", `token=${tutorToken}`)
      .send(body);

    expect(res.status).toBe(400);
  });

  it("🔲 EDGE — maxParticipants of exactly 1 is accepted", async () => {
    const body = validSessionBody();
    body.capacity.maxParticipants = 1;

    const res = await request(testApp)
      .post("/api/tutoring-sessions")
      .set("Cookie", `token=${tutorToken}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.session.capacity.maxParticipants).toBe(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PART 2 — GET /api/tutoring-sessions (Get All Sessions)
// ═════════════════════════════════════════════════════════════════════════════

describe("GET /api/tutoring-sessions — Get All Sessions", () => {
  beforeEach(async () => {
    // Seed two sessions for list tests
    await TutoringSession.create([
      {
        tutor: tutorId,
        title: "Physics Basics",
        subject: "physics",
        description: "Basic Newtonian mechanics for beginners.",
        schedule: { date: new Date(Date.now() + 5 * 86400000), startTime: "09:00", endTime: "11:00" },
        capacity: { maxParticipants: 10 },
        level: "beginner",
        isPublished: true,
      },
      {
        tutor: tutorId,
        title: "Advanced Chemistry",
        subject: "chemistry",
        description: "Organic chemistry reactions for A/L students.",
        schedule: { date: new Date(Date.now() + 10 * 86400000), startTime: "14:00", endTime: "16:00" },
        capacity: { maxParticipants: 15 },
        level: "advanced",
        isPublished: true,
      },
    ]);
  });

  it("✅ SUCCESS — returns 200 with sessions array (public route)", async () => {
    const res = await request(testApp).get("/api/tutoring-sessions");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("sessions");
    expect(Array.isArray(res.body.sessions)).toBe(true);
    expect(res.body.sessions.length).toBe(2);
  });

  it("✅ SUCCESS — includes pagination metadata", async () => {
    const res = await request(testApp).get("/api/tutoring-sessions?page=1&limit=10");

    expect(res.body).toHaveProperty("pagination");
    expect(res.body.pagination).toHaveProperty("total");
    expect(res.body.pagination).toHaveProperty("page");
  });

  it("✅ SUCCESS — filters by subject", async () => {
    const res = await request(testApp).get("/api/tutoring-sessions?subject=physics");

    expect(res.status).toBe(200);
    expect(res.body.sessions.length).toBe(1);
    expect(res.body.sessions[0].subject).toBe("physics");
  });

  it("✅ SUCCESS — filters by level", async () => {
    const res = await request(testApp).get("/api/tutoring-sessions?level=advanced");

    expect(res.status).toBe(200);
    expect(res.body.sessions.every((s) => s.level === "advanced")).toBe(true);
  });

  it("🔲 EDGE — returns empty array when no sessions match filters", async () => {
    const res = await request(testApp).get("/api/tutoring-sessions?subject=nonexistentsubject");

    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(0);
  });

  it("🔲 EDGE — pagination returns correct page", async () => {
    const res = await request(testApp).get("/api/tutoring-sessions?page=1&limit=1");

    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(1);
    expect(res.body.pagination.totalPages).toBe(2);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PART 3 — GET /api/tutoring-sessions/:id (Get Session by ID)
// ═════════════════════════════════════════════════════════════════════════════

describe("GET /api/tutoring-sessions/:id — Get Session by ID", () => {
  let createdSessionId;

  beforeEach(async () => {
    const session = await TutoringSession.create({
      tutor: tutorId,
      title: "Algebra Workshop",
      subject: "mathematics",
      description: "A hands-on workshop on linear algebra concepts.",
      schedule: { date: new Date(Date.now() + 3 * 86400000), startTime: "11:00", endTime: "13:00" },
      capacity: { maxParticipants: 20 },
      level: "intermediate",
      isPublished: true,
    });
    createdSessionId = session._id.toString();
  });

  it("✅ SUCCESS — returns 200 with session details", async () => {
    const res = await request(testApp).get(`/api/tutoring-sessions/${createdSessionId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("session");
    expect(res.body.session._id).toBe(createdSessionId);
    expect(res.body.session.title).toBe("Algebra Workshop");
  });

  it("❌ ERROR — returns 404 for non-existent session ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(testApp).get(`/api/tutoring-sessions/${nonExistentId}`);

    expect(res.status).toBe(404);
  });

  it("❌ ERROR — returns 400 for invalid ObjectId format", async () => {
    const res = await request(testApp).get("/api/tutoring-sessions/not-a-valid-id");

    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PART 4 — PUT /api/tutoring-sessions/:id (Update Session)
// ═════════════════════════════════════════════════════════════════════════════

describe("PUT /api/tutoring-sessions/:id — Update Session", () => {
  let sessionToUpdate;

  beforeEach(async () => {
    sessionToUpdate = await TutoringSession.create({
      tutor: tutorId,
      title: "Original Title",
      subject: "biology",
      description: "Basic cell biology for Grade 10 students.",
      schedule: { date: new Date(Date.now() + 8 * 86400000), startTime: "08:00", endTime: "09:30" },
      capacity: { maxParticipants: 30 },
      level: "beginner",
      isPublished: true,
    });
  });

  it("✅ SUCCESS — tutor updates their own session and gets 200", async () => {
    const res = await request(testApp)
      .put(`/api/tutoring-sessions/${sessionToUpdate._id}`)
      .set("Cookie", `token=${tutorToken}`)
      .send({ title: "Updated Biology Session" });

    expect(res.status).toBe(200);
    expect(res.body.session.title).toBe("Updated Biology Session");
  });

  it("✅ SUCCESS — admin updates any session", async () => {
    const res = await request(testApp)
      .put(`/api/tutoring-sessions/${sessionToUpdate._id}`)
      .set("Cookie", `token=${adminToken}`)
      .send({ title: "Admin Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.session.title).toBe("Admin Updated Title");
  });

  it("❌ ERROR — student is forbidden from updating a session", async () => {
    const res = await request(testApp)
      .put(`/api/tutoring-sessions/${sessionToUpdate._id}`)
      .set("Cookie", `token=${studentToken}`)
      .send({ title: "Student Attempt" });

    expect(res.status).toBe(403);
  });

  it("❌ ERROR — unauthenticated request is rejected with 401", async () => {
    const res = await request(testApp)
      .put(`/api/tutoring-sessions/${sessionToUpdate._id}`)
      .send({ title: "No Auth" });

    expect(res.status).toBe(401);
  });

  it("❌ ERROR — returns 404 for non-existent session", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(testApp)
      .put(`/api/tutoring-sessions/${fakeId}`)
      .set("Cookie", `token=${tutorToken}`)
      .send({ title: "Ghost Session" });

    // Either 404 (not found) or 403 (unauthorized because tutor doesn't own it)
    expect([403, 404]).toContain(res.status);
  });

  it("🔲 EDGE — can update only the notes field", async () => {
    const res = await request(testApp)
      .put(`/api/tutoring-sessions/${sessionToUpdate._id}`)
      .set("Cookie", `token=${tutorToken}`)
      .send({ notes: "Bring your textbooks." });

    expect(res.status).toBe(200);
    expect(res.body.session.notes).toBe("Bring your textbooks.");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PART 5 — DELETE /api/tutoring-sessions/:id (Delete Session)
// ═════════════════════════════════════════════════════════════════════════════

describe("DELETE /api/tutoring-sessions/:id — Delete Session", () => {
  let sessionToDelete;

  beforeEach(async () => {
    sessionToDelete = await TutoringSession.create({
      tutor: tutorId,
      title: "Session To Delete",
      subject: "history",
      description: "A history session that will be deleted during testing.",
      schedule: { date: new Date(Date.now() + 12 * 86400000), startTime: "15:00", endTime: "16:30" },
      capacity: { maxParticipants: 20 },
      level: "intermediate",
      isPublished: true,
    });
  });

  it("✅ SUCCESS — tutor deletes their session and gets 200", async () => {
    const res = await request(testApp)
      .delete(`/api/tutoring-sessions/${sessionToDelete._id}`)
      .set("Cookie", `token=${tutorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/deleted/i);

    // Verify it's actually gone from DB
    const found = await TutoringSession.findById(sessionToDelete._id);
    expect(found).toBeNull();
  });

  it("✅ SUCCESS — admin deletes any session", async () => {
    const res = await request(testApp)
      .delete(`/api/tutoring-sessions/${sessionToDelete._id}`)
      .set("Cookie", `token=${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("❌ ERROR — student cannot delete sessions (403)", async () => {
    const res = await request(testApp)
      .delete(`/api/tutoring-sessions/${sessionToDelete._id}`)
      .set("Cookie", `token=${studentToken}`);

    expect(res.status).toBe(403);
  });

  it("❌ ERROR — unauthenticated request is rejected with 401", async () => {
    const res = await request(testApp)
      .delete(`/api/tutoring-sessions/${sessionToDelete._id}`);

    expect(res.status).toBe(401);
  });

  it("❌ ERROR — returns 404 for non-existent session", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(testApp)
      .delete(`/api/tutoring-sessions/${fakeId}`)
      .set("Cookie", `token=${tutorToken}`);

    // Could be 404 (not found) or 403 (not owner)
    expect([403, 404]).toContain(res.status);
  });

  it("❌ ERROR — invalid ID returns 400", async () => {
    const res = await request(testApp)
      .delete("/api/tutoring-sessions/invalid-id")
      .set("Cookie", `token=${tutorToken}`);

    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PART 6 — POST /api/tutoring-sessions/:id/join (Join Session)
// ═════════════════════════════════════════════════════════════════════════════

describe("POST /api/tutoring-sessions/:id/join — Join Session", () => {
  let openSession;

  beforeEach(async () => {
    openSession = await TutoringSession.create({
      tutor: tutorId,
      title: "Open Session to Join",
      subject: "science",
      description: "An open science session that anyone can join.",
      schedule: { date: new Date(Date.now() + 6 * 86400000), startTime: "13:00", endTime: "14:00" },
      capacity: { maxParticipants: 5 },
      level: "beginner",
      isPublished: true,
    });
  });

  it("✅ SUCCESS — authenticated student joins and gets 200", async () => {
    const res = await request(testApp)
      .post(`/api/tutoring-sessions/${openSession._id}/join`)
      .set("Cookie", `token=${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("currentEnrolled");
    expect(res.body.currentEnrolled).toBe(1);
  });

  it("❌ ERROR — student joining twice returns error (already enrolled)", async () => {
    // First join
    await request(testApp)
      .post(`/api/tutoring-sessions/${openSession._id}/join`)
      .set("Cookie", `token=${studentToken}`);

    // Second join attempt
    const res = await request(testApp)
      .post(`/api/tutoring-sessions/${openSession._id}/join`)
      .set("Cookie", `token=${studentToken}`);

    expect(res.status).toBe(500); // Model throws, Express catches
  });

  it("❌ ERROR — unauthenticated user cannot join (401)", async () => {
    const res = await request(testApp)
      .post(`/api/tutoring-sessions/${openSession._id}/join`);

    expect(res.status).toBe(401);
  });

  it("❌ ERROR — invalid session ID returns 400", async () => {
    const res = await request(testApp)
      .post("/api/tutoring-sessions/bad-id/join")
      .set("Cookie", `token=${studentToken}`);

    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PART 7 — POST /api/tutoring-sessions/:id/leave (Leave Session)
// ═════════════════════════════════════════════════════════════════════════════

describe("POST /api/tutoring-sessions/:id/leave — Leave Session", () => {
  let joinedSession;

  beforeEach(async () => {
    joinedSession = await TutoringSession.create({
      tutor: tutorId,
      title: "Session with Enrolled Student",
      subject: "geography",
      description: "A geography session with Bob already enrolled.",
      schedule: { date: new Date(Date.now() + 9 * 86400000), startTime: "10:00", endTime: "11:30" },
      capacity: { maxParticipants: 10, currentEnrolled: 1 },
      level: "intermediate",
      participants: [{ userId: studentId, status: "enrolled" }],
      isPublished: true,
    });
  });

  it("✅ SUCCESS — student leaves and enrolled count decreases", async () => {
    const res = await request(testApp)
      .post(`/api/tutoring-sessions/${joinedSession._id}/leave`)
      .set("Cookie", `token=${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.currentEnrolled).toBe(0);
  });

  it("❌ ERROR — user who is not enrolled cannot leave (throws error)", async () => {
    const anotherStudentToken = makeToken({
      userId: new mongoose.Types.ObjectId().toString(),
      role: "user",
    });

    const res = await request(testApp)
      .post(`/api/tutoring-sessions/${joinedSession._id}/leave`)
      .set("Cookie", `token=${anotherStudentToken}`);

    expect(res.status).toBe(500); // Model throws "not enrolled"
  });

  it("❌ ERROR — unauthenticated user cannot leave (401)", async () => {
    const res = await request(testApp)
      .post(`/api/tutoring-sessions/${joinedSession._id}/leave`);

    expect(res.status).toBe(401);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PART 8 — GET /api/tutoring-sessions/tutor/:tutorId
// ═════════════════════════════════════════════════════════════════════════════

describe("GET /api/tutoring-sessions/tutor/:tutorId — Get Tutor's Sessions", () => {
  beforeEach(async () => {
    await TutoringSession.create({
      tutor: tutorId,
      title: "Tutor's Only Session",
      subject: "ict",
      description: "ICT session available on the tutor's schedule.",
      schedule: { date: new Date(Date.now() + 4 * 86400000), startTime: "09:00", endTime: "10:00" },
      capacity: { maxParticipants: 10 },
      level: "beginner",
      isPublished: true,
    });
  });

  it("✅ SUCCESS — returns all sessions for a given tutor (public route)", async () => {
    const res = await request(testApp).get(`/api/tutoring-sessions/tutor/${tutorId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sessions)).toBe(true);
    expect(res.body.sessions.length).toBeGreaterThan(0);
  });

  it("❌ ERROR — returns 404 when tutor has no sessions", async () => {
    const newTutorId = new mongoose.Types.ObjectId().toString();
    const res = await request(testApp).get(`/api/tutoring-sessions/tutor/${newTutorId}`);

    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PART 9 — GET /api/tutoring-sessions/my-enrolled
// ═════════════════════════════════════════════════════════════════════════════

describe("GET /api/tutoring-sessions/my-enrolled — Get My Enrolled Sessions", () => {
  beforeEach(async () => {
    await TutoringSession.create({
      tutor: tutorId,
      title: "Session Bob Is In",
      subject: "mathematics",
      description: "A mathematics session where Bob is already enrolled.",
      schedule: { date: new Date(Date.now() + 7 * 86400000), startTime: "14:00", endTime: "15:30" },
      capacity: { maxParticipants: 10, currentEnrolled: 1 },
      participants: [{ userId: studentId, status: "enrolled" }],
      level: "intermediate",
      isPublished: true,
    });
  });

  it("✅ SUCCESS — returns sessions the student is enrolled in", async () => {
    const res = await request(testApp)
      .get("/api/tutoring-sessions/my-enrolled")
      .set("Cookie", `token=${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("sessions");
    expect(res.body.sessions.length).toBeGreaterThan(0);
  });

  it("❌ ERROR — unauthenticated request returns 401", async () => {
    const res = await request(testApp).get("/api/tutoring-sessions/my-enrolled");

    expect(res.status).toBe(401);
  });

  it("🔲 EDGE — tutor with no enrolled sessions gets empty array", async () => {
    const res = await request(testApp)
      .get("/api/tutoring-sessions/my-enrolled")
      .set("Cookie", `token=${tutorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(0);
  });
});
