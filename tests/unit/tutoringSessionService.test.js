/**
 * unit/tutoringSessionService.test.js
 * ─────────────────────────────────────────────────────────────────
 * Unit Tests — Tutoring Session Service Layer
 *
 * All external dependencies (TutoringSession model, Google Calendar
 * service, validation module) are mocked so each service function
 * is tested in complete isolation.
 *
 * Coverage:
 *   createSession | updateSession | deleteSession | getAllSessions |
 *   getSessionById | joinSession | leaveSession | getTutorSessions |
 *   getMyEnrolledSessions
 * ─────────────────────────────────────────────────────────────────
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import mongoose from "mongoose";

// ─── Mock: Google Calendar (prevents real API calls in tests) ─────────────────
jest.unstable_mockModule("../../services/googleCalendarService.js", () => ({
  createCalendarEvent: jest.fn().mockResolvedValue("fake-google-event-id"),
  updateCalendarEvent: jest.fn().mockResolvedValue(true),
  deleteCalendarEvent: jest.fn().mockResolvedValue(true),
}));

// ─── Mock: Validation module (assume all inputs are valid in unit tests) ──────
jest.unstable_mockModule("../../validations/tutoringSession.validation.js", () => ({
  validateSessionPayload: jest.fn(),
  validateObjectId: jest.fn(),
  validateUpdatePayload: jest.fn(),
  validateFilterQuery: jest.fn(),
}));

// ─── Build a realistic fake session document ──────────────────────────────────
const fakeId = new mongoose.Types.ObjectId();
const fakeTutorId = new mongoose.Types.ObjectId();
const fakeUserId = new mongoose.Types.ObjectId();

const makeFakeSession = (overrides = {}) => ({
  _id: fakeId,
  tutor: fakeTutorId,
  title: "Calculus for Grade 12",
  subject: "mathematics",
  description: "An advanced session covering integration and differentiation.",
  schedule: {
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    startTime: "09:00",
    endTime: "10:30",
  },
  capacity: { maxParticipants: 20, currentEnrolled: 0 },
  participants: [],
  status: "scheduled",
  level: "advanced",
  tags: ["calculus", "grade12"],
  isPublished: true,
  googleEventId: null,
  save: jest.fn().mockResolvedValue(true),
  populate: jest.fn().mockReturnThis(),
  addParticipant: jest.fn().mockResolvedValue(true),
  removeParticipant: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ─── Mock: TutoringSession Model ──────────────────────────────────────────────
let mockSession;

jest.unstable_mockModule("../../models/TutoringSessionModel.js", () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

// ─── Import after mocking ─────────────────────────────────────────────────────
const { default: TutoringSession } = await import("../../models/TutoringSessionModel.js");
const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = await import("../../services/googleCalendarService.js");
const service = await import("../../services/tutoringSessionService.js");

// ─── Reusable fake user objects ───────────────────────────────────────────────
const tutorUser = { userId: fakeTutorId.toString(), role: "tutor" };
const adminUser = { userId: new mongoose.Types.ObjectId().toString(), role: "admin" };
const studentUser = { userId: fakeUserId.toString(), role: "user" };

const validPayload = {
  title: "Calculus for Grade 12",
  subject: "Mathematics",
  description: "An advanced session covering integration and differentiation.",
  schedule: {
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: "09:00",
    endTime: "10:30",
  },
  capacity: { maxParticipants: 20 },
  level: "advanced",
  tags: ["calculus"],
};

// ─── Reset mocks before each test ────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = makeFakeSession();
});

// ─────────────────────────────────────────────────────────────────────────────

describe("createSession()", () => {
  it("✅ SUCCESS — creates a session and returns it", async () => {
    const populateChain = { ...mockSession, populate: jest.fn().mockResolvedValue(mockSession) };
    TutoringSession.create.mockResolvedValue(populateChain);

    const result = await service.createSession(tutorUser, validPayload);

    expect(TutoringSession.create).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });

  it("✅ SUCCESS — attempts to create a Google Calendar event", async () => {
    const populateChain = { ...mockSession, populate: jest.fn().mockResolvedValue(mockSession) };
    TutoringSession.create.mockResolvedValue(populateChain);

    await service.createSession(tutorUser, validPayload);

    expect(createCalendarEvent).toHaveBeenCalledTimes(1);
  });

  it("✅ SUCCESS — session is still saved even if calendar creation fails", async () => {
    createCalendarEvent.mockRejectedValueOnce(new Error("Calendar API down"));
    const populateChain = { ...mockSession, populate: jest.fn().mockResolvedValue(mockSession) };
    TutoringSession.create.mockResolvedValue(populateChain);

    await expect(service.createSession(tutorUser, validPayload)).resolves.toBeDefined();
  });

  it("❌ ERROR — throws when title is empty", async () => {
    const noTitle = { ...validPayload, title: "" };
    await expect(service.createSession(tutorUser, noTitle)).rejects.toThrow("Session title is required");
  });

  it("❌ ERROR — throws when title is only whitespace", async () => {
    const blankTitle = { ...validPayload, title: "   " };
    await expect(service.createSession(tutorUser, blankTitle)).rejects.toThrow("Session title is required");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("updateSession()", () => {
  it("✅ SUCCESS — updates a session and returns the updated document", async () => {
    TutoringSession.findById.mockResolvedValue(mockSession);
    const updated = { ...mockSession, title: "Updated Title", populate: jest.fn().mockResolvedValue(mockSession) };
    TutoringSession.findByIdAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(updated),
    });

    const result = await service.updateSession(tutorUser, fakeId.toString(), { title: "Updated Title" });
    expect(TutoringSession.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(result.title).toBe("Updated Title");
  });

  it("❌ ERROR — throws NotFoundError when session does not exist", async () => {
    TutoringSession.findById.mockResolvedValue(null);

    await expect(
      service.updateSession(tutorUser, fakeId.toString(), { title: "X" })
    ).rejects.toThrow("Session not found");
  });

  it("❌ ERROR — throws UnauthorizedError when user is not the owner", async () => {
    TutoringSession.findById.mockResolvedValue(mockSession); // tutor is fakeTutorId

    const otherUser = { userId: new mongoose.Types.ObjectId().toString(), role: "user" };
    await expect(
      service.updateSession(otherUser, fakeId.toString(), { title: "Y" })
    ).rejects.toThrow("Not authorized");
  });

  it("✅ SUCCESS — admin can update any session", async () => {
    TutoringSession.findById.mockResolvedValue(mockSession);
    const updated = { ...mockSession, populate: jest.fn().mockResolvedValue(mockSession) };
    TutoringSession.findByIdAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(updated),
    });

    await expect(
      service.updateSession(adminUser, fakeId.toString(), { title: "Admin Update" })
    ).resolves.toBeDefined();
  });

  it("🔲 EDGE — updates calendar event when googleEventId exists", async () => {
    const sessionWithCalendar = makeFakeSession({ googleEventId: "google-evt-123" });
    TutoringSession.findById.mockResolvedValue(sessionWithCalendar);
    const updated = { ...sessionWithCalendar, googleEventId: "google-evt-123", populate: jest.fn().mockResolvedValue(sessionWithCalendar) };
    TutoringSession.findByIdAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(updated),
    });

    await service.updateSession(tutorUser, fakeId.toString(), { title: "With Calendar" });
    expect(updateCalendarEvent).toHaveBeenCalledWith("google-evt-123", expect.anything());
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("deleteSession()", () => {
  it("✅ SUCCESS — deletes a session successfully", async () => {
    TutoringSession.findById.mockResolvedValue(mockSession);
    TutoringSession.findByIdAndDelete.mockResolvedValue(true);

    await expect(
      service.deleteSession(tutorUser, fakeId.toString())
    ).resolves.toBeUndefined();

    expect(TutoringSession.findByIdAndDelete).toHaveBeenCalledWith(fakeId.toString());
  });

  it("❌ ERROR — throws NotFoundError when session does not exist", async () => {
    TutoringSession.findById.mockResolvedValue(null);

    await expect(
      service.deleteSession(tutorUser, fakeId.toString())
    ).rejects.toThrow("Session not found");
  });

  it("❌ ERROR — throws UnauthorizedError for non-owner, non-admin", async () => {
    TutoringSession.findById.mockResolvedValue(mockSession);

    const outsider = { userId: new mongoose.Types.ObjectId().toString(), role: "user" };
    await expect(
      service.deleteSession(outsider, fakeId.toString())
    ).rejects.toThrow("Not authorized");
  });

  it("🔲 EDGE — deletes calendar event if googleEventId is set", async () => {
    const sessionWithCalendar = makeFakeSession({ googleEventId: "cal-event-456" });
    TutoringSession.findById.mockResolvedValue(sessionWithCalendar);
    TutoringSession.findByIdAndDelete.mockResolvedValue(true);

    await service.deleteSession(tutorUser, fakeId.toString());
    expect(deleteCalendarEvent).toHaveBeenCalledWith("cal-event-456");
  });

  it("🔲 EDGE — session is still deleted even if calendar deletion fails", async () => {
    const sessionWithCalendar = makeFakeSession({ googleEventId: "bad-cal-id" });
    TutoringSession.findById.mockResolvedValue(sessionWithCalendar);
    TutoringSession.findByIdAndDelete.mockResolvedValue(true);
    deleteCalendarEvent.mockRejectedValueOnce(new Error("Calendar API error"));

    await expect(
      service.deleteSession(tutorUser, fakeId.toString())
    ).resolves.toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getAllSessions()", () => {
  it("✅ SUCCESS — returns sessions and pagination meta", async () => {
    TutoringSession.countDocuments.mockResolvedValue(5);
    TutoringSession.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([mockSession]),
    });

    const result = await service.getAllSessions({ page: "1", limit: "10" });

    expect(result.sessions).toHaveLength(1);
    expect(result.pagination.total).toBe(5);
    expect(result.pagination.page).toBe(1);
  });

  it("🔲 EDGE — page defaults to 1 when not provided", async () => {
    TutoringSession.countDocuments.mockResolvedValue(0);
    TutoringSession.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });

    const result = await service.getAllSessions({});
    expect(result.pagination.page).toBe(1);
  });

  it("🔲 EDGE — limit is capped at 100", async () => {
    TutoringSession.countDocuments.mockResolvedValue(0);
    const limitSpy = jest.fn().mockReturnThis();
    TutoringSession.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: limitSpy,
      lean: jest.fn().mockResolvedValue([]),
    });

    await service.getAllSessions({ limit: "999" });
    // The limit passed to .limit() should be capped at 100
    expect(limitSpy).toHaveBeenCalledWith(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getSessionById()", () => {
  it("✅ SUCCESS — returns the session document", async () => {
    // The real service chains: TutoringSession.findById(id).populate(...).populate(...)
    // We must return an object that supports two chained .populate() calls.
    const firstPopulate = { populate: jest.fn().mockResolvedValue(mockSession) };
    TutoringSession.findById.mockReturnValue({ populate: jest.fn().mockReturnValue(firstPopulate) });

    const result = await service.getSessionById(fakeId.toString());
    expect(result).toBeDefined();
  });

  it("❌ ERROR — throws NotFoundError when session is null", async () => {
    const firstPopulate = { populate: jest.fn().mockResolvedValue(null) };
    TutoringSession.findById.mockReturnValue({ populate: jest.fn().mockReturnValue(firstPopulate) });

    await expect(service.getSessionById(fakeId.toString())).rejects.toThrow("Session not found");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("joinSession()", () => {
  it("✅ SUCCESS — calls addParticipant and returns enrolled count", async () => {
    const session = makeFakeSession({ capacity: { maxParticipants: 20, currentEnrolled: 3 } });
    session.addParticipant = jest.fn().mockResolvedValue(true);
    TutoringSession.findById.mockResolvedValue(session);

    const result = await service.joinSession(studentUser, fakeId.toString());
    expect(session.addParticipant).toHaveBeenCalledWith(studentUser.userId);
    expect(typeof result).toBe("number");
  });

  it("❌ ERROR — throws UnauthorizedError when user is null", async () => {
    await expect(service.joinSession(null, fakeId.toString())).rejects.toThrow("Authentication required");
  });

  it("❌ ERROR — throws NotFoundError when session does not exist", async () => {
    TutoringSession.findById.mockResolvedValue(null);
    await expect(service.joinSession(studentUser, fakeId.toString())).rejects.toThrow("Session not found");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("leaveSession()", () => {
  it("✅ SUCCESS — calls removeParticipant and returns enrolled count", async () => {
    const session = makeFakeSession({ capacity: { maxParticipants: 20, currentEnrolled: 2 } });
    session.removeParticipant = jest.fn().mockResolvedValue(true);
    TutoringSession.findById.mockResolvedValue(session);

    const result = await service.leaveSession(studentUser, fakeId.toString());
    expect(session.removeParticipant).toHaveBeenCalledWith(studentUser.userId);
    expect(typeof result).toBe("number");
  });

  it("❌ ERROR — throws UnauthorizedError when user is null", async () => {
    await expect(service.leaveSession(null, fakeId.toString())).rejects.toThrow("Authentication required");
  });

  it("❌ ERROR — throws NotFoundError when session does not exist", async () => {
    TutoringSession.findById.mockResolvedValue(null);
    await expect(service.leaveSession(studentUser, fakeId.toString())).rejects.toThrow("Session not found");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getTutorSessions()", () => {
  it("✅ SUCCESS — returns sessions for a given tutor", async () => {
    TutoringSession.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([mockSession]),
    });

    const result = await service.getTutorSessions(fakeTutorId.toString());
    expect(Array.isArray(result)).toBe(true);
  });

  it("✅ SUCCESS — returns empty array when tutor has no sessions", async () => {
    TutoringSession.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    const result = await service.getTutorSessions(fakeTutorId.toString());
    expect(result).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getMyEnrolledSessions()", () => {
  it("✅ SUCCESS — returns enrolled sessions for authenticated user", async () => {
    TutoringSession.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([mockSession]),
    });

    const result = await service.getMyEnrolledSessions(studentUser);
    expect(Array.isArray(result)).toBe(true);
  });

  it("❌ ERROR — throws UnauthorizedError when user is null", async () => {
    await expect(service.getMyEnrolledSessions(null)).rejects.toThrow("Authentication required");
  });
});
