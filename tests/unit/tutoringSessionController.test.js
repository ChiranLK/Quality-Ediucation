/**
 * unit/tutoringSessionController.test.js
 * ─────────────────────────────────────────────────────────────────
 * Unit Tests — Tutoring Session Controller Layer
 *
 * The entire service layer is mocked so controller unit tests only
 * verify that:
 *   1. The correct service method is called with the right args.
 *   2. The correct HTTP status and response shape are returned.
 *   3. Errors from the service are propagated to next().
 * ─────────────────────────────────────────────────────────────────
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import mongoose from "mongoose";

// ─── Mock the entire service layer ───────────────────────────────────────────
jest.unstable_mockModule("../../services/tutoringSessionService.js", () => ({
  createSession: jest.fn(),
  getAllSessions: jest.fn(),
  getSessionById: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
  joinSession: jest.fn(),
  leaveSession: jest.fn(),
  getTutorSessions: jest.fn(),
  getMyEnrolledSessions: jest.fn(),
}));

// Mock TutoringSession model used directly in getTutoringSessionsByTutor
jest.unstable_mockModule("../../models/TutoringSessionModel.js", () => ({
  default: {
    find: jest.fn(),
  },
}));

// ─── Import after mocking ─────────────────────────────────────────────────────
const service = await import("../../services/tutoringSessionService.js");
const { default: TutoringSession } = await import("../../models/TutoringSessionModel.js");
const {
  createTutoringSession,
  getAllTutoringSessions,
  getTutoringSessionById,
  updateTutoringSession,
  deleteTutoringSession,
  joinTutoringSession,
  leaveTutoringSession,
  getTutorSessions,
  getMyEnrolledSessions,
  getTutoringSessionsByTutor,
} = await import("../../Controllers/tutoringSessionController.js");

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fakeId = new mongoose.Types.ObjectId();
const fakeTutorId = new mongoose.Types.ObjectId();

const fakeSession = {
  _id: fakeId,
  tutor: fakeTutorId,
  title: "Calculus for Grade 12",
  subject: "mathematics",
  status: "scheduled",
};

/** Creates a minimal Express-style mock: req / res / next */
const makeMocks = (overrides = {}) => ({
  req: {
    user: { userId: fakeTutorId.toString(), role: "tutor" },
    body: {},
    params: { id: fakeId.toString(), tutorId: fakeTutorId.toString() },
    query: {},
    ...overrides.req,
  },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    ...overrides.res,
  },
  next: jest.fn(),
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────

describe("createTutoringSession()", () => {
  it("✅ SUCCESS — returns 201 with the created session", async () => {
    service.createSession.mockResolvedValue(fakeSession);
    const { req, res } = makeMocks({ req: { body: { title: "Calculus" } } });

    await createTutoringSession(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Tutoring session created", session: fakeSession })
    );
  });

  it("❌ ERROR — propagates service errors", async () => {
    service.createSession.mockRejectedValue(new Error("Validation failed"));
    const { req, res, next } = makeMocks();

    await expect(createTutoringSession(req, res, next)).rejects.toThrow("Validation failed");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getAllTutoringSessions()", () => {
  it("✅ SUCCESS — returns 200 with sessions and pagination", async () => {
    const pagResult = {
      sessions: [fakeSession],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    service.getAllSessions.mockResolvedValue(pagResult);
    const { req, res } = makeMocks({ req: { query: { page: "1" } } });

    await getAllTutoringSessions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sessions: pagResult.sessions, pagination: pagResult.pagination })
    );
  });

  it("🔲 EDGE — works with empty sessions list", async () => {
    service.getAllSessions.mockResolvedValue({ sessions: [], pagination: { total: 0 } });
    const { req, res } = makeMocks();

    await getAllTutoringSessions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getTutoringSessionById()", () => {
  it("✅ SUCCESS — returns 200 with the session", async () => {
    service.getSessionById.mockResolvedValue(fakeSession);
    const { req, res } = makeMocks();

    await getTutoringSessionById(req, res);

    expect(service.getSessionById).toHaveBeenCalledWith(fakeId.toString());
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ session: fakeSession })
    );
  });

  it("❌ ERROR — propagates NotFoundError", async () => {
    service.getSessionById.mockRejectedValue(new Error("Session not found"));
    const { req, res } = makeMocks();

    await expect(getTutoringSessionById(req, res)).rejects.toThrow("Session not found");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("updateTutoringSession()", () => {
  it("✅ SUCCESS — returns 200 with the updated session", async () => {
    const updated = { ...fakeSession, title: "Updated Title" };
    service.updateSession.mockResolvedValue(updated);
    const { req, res } = makeMocks({ req: { body: { title: "Updated Title" } } });

    await updateTutoringSession(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ session: updated })
    );
  });

  it("❌ ERROR — propagates UnauthorizedError", async () => {
    service.updateSession.mockRejectedValue(new Error("Not authorized"));
    const { req, res } = makeMocks();

    await expect(updateTutoringSession(req, res)).rejects.toThrow("Not authorized");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("deleteTutoringSession()", () => {
  it("✅ SUCCESS — returns 200 with deletion message", async () => {
    service.deleteSession.mockResolvedValue(undefined);
    const { req, res } = makeMocks();

    await deleteTutoringSession(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Session deleted successfully" })
    );
  });

  it("❌ ERROR — propagates error when session not found", async () => {
    service.deleteSession.mockRejectedValue(new Error("Session not found"));
    const { req, res } = makeMocks();

    await expect(deleteTutoringSession(req, res)).rejects.toThrow("Session not found");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("joinTutoringSession()", () => {
  it("✅ SUCCESS — returns 200 with currentEnrolled count", async () => {
    service.joinSession.mockResolvedValue(5);
    const { req, res } = makeMocks();

    await joinTutoringSession(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Joined session", currentEnrolled: 5 })
    );
  });

  it("❌ ERROR — propagates error when session is full", async () => {
    service.joinSession.mockRejectedValue(new Error("Session is at full capacity"));
    const { req, res } = makeMocks();

    await expect(joinTutoringSession(req, res)).rejects.toThrow("full capacity");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("leaveTutoringSession()", () => {
  it("✅ SUCCESS — returns 200 with updated enrolled count", async () => {
    service.leaveSession.mockResolvedValue(4);
    const { req, res } = makeMocks();

    await leaveTutoringSession(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Left session", currentEnrolled: 4 })
    );
  });

  it("❌ ERROR — propagates error when user is not enrolled", async () => {
    service.leaveSession.mockRejectedValue(new Error("User is not enrolled in this session"));
    const { req, res } = makeMocks();

    await expect(leaveTutoringSession(req, res)).rejects.toThrow("not enrolled");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getTutorSessions()", () => {
  it("✅ SUCCESS — returns 200 with tutor sessions array", async () => {
    service.getTutorSessions.mockResolvedValue([fakeSession]);
    const { req, res } = makeMocks();

    await getTutorSessions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sessions: [fakeSession] })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getMyEnrolledSessions()", () => {
  it("✅ SUCCESS — returns 200 with enrolled sessions", async () => {
    service.getMyEnrolledSessions.mockResolvedValue([fakeSession]);
    const { req, res } = makeMocks();

    await getMyEnrolledSessions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Your enrolled sessions" })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getTutoringSessionsByTutor()", () => {
  it("✅ SUCCESS — returns 200 with sessions from model", async () => {
    TutoringSession.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([fakeSession]),
    });
    const { req, res } = makeMocks();

    await getTutoringSessionsByTutor(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("❌ ERROR — returns 404 when no sessions found", async () => {
    TutoringSession.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    });
    const { req, res } = makeMocks();

    await getTutoringSessionsByTutor(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("❌ ERROR — returns 500 on unexpected database error", async () => {
    TutoringSession.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error("DB crash")),
    });
    const { req, res } = makeMocks();

    await getTutoringSessionsByTutor(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
