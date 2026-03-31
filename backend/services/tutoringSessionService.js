// services/tutoringSessionService.js
import TutoringSession from "../models/TutoringSessionModel.js";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../errors/customErrors.js";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "./googleCalendarService.js";
import * as validation from "../validations/tutoringSession.validation.js";
import * as utils from "../utils/tutoringSessionUtils.js";

// --- Helpers ---
const ensureSessionExists = (session) => {
  if (!session) throw new NotFoundError("Session not found");
  return session;
};

const checkOwnershipOrAdmin = (session, user) => {
  const isTutor = String(session.tutor) === String(user.userId);
  const isAdmin = user.role === "admin";
  if (!(isTutor || isAdmin)) throw new UnauthorizedError("Not authorized");
};

// --- Services ---
export async function createSession(user, payload) {
  validation.validateSessionPayload(payload);

  const {
    title,
    subject,
    description,
    schedule,
    capacity,
    topic,
    location,
    level,
    tags,
    notes,
    grade,
  } = payload;

  const sessionData = {
    tutor: user.userId,
    title: title || subject,
    subject: String(subject).trim().toLowerCase(),
    description: String(description).trim(),
    topic: topic ? String(topic).trim() : undefined,
    grade: grade || level || "intermediate",
    schedule: {
      date: new Date(schedule.date),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    },
    location: location || { type: "online" },
    capacity: { maxParticipants: parseInt(capacity.maxParticipants, 10), currentEnrolled: 0 },
    level: level || "intermediate",
    tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
    notes: notes ? notes.trim() : undefined,
    isPublished: true,
  };

  const session = await TutoringSession.create(sessionData);
  await session.populate("tutor", "fullName email role");

  // Google Calendar
  if (session) {
    try {
      const googleEventId = await createCalendarEvent(session);
      session.googleEventId = googleEventId;
      await session.save();
      console.log("✅ Google Calendar event created:", googleEventId);
    } catch (err) {
      console.error("Calendar create error:", err.message);
    }
  }

  return session;
}

export async function updateSession(user, id, updates) {
  validation.validateObjectId(id);
  validation.validateUpdatePayload(updates);

  const session = await TutoringSession.findById(id);
  ensureSessionExists(session);
  checkOwnershipOrAdmin(session, user);

  const allowed = ["title", "subject", "description", "topic", "schedule", "location", "level", "grade", "tags", "notes", "status", "capacity"];
  const data = {};
  allowed.forEach((k) => { if (k in updates) data[k] = updates[k]; });

  const updated = await TutoringSession.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate("tutor", "fullName email role");

  if (updated.googleEventId) {
    try {
      await updateCalendarEvent(updated.googleEventId, updated);
    } catch (err) {
      console.error("Calendar update failed:", err.message);
    }
  }
  return updated;
}

export async function deleteSession(user, id) {
  validation.validateObjectId(id);
  const session = await TutoringSession.findById(id);
  ensureSessionExists(session);
  checkOwnershipOrAdmin(session, user);

  if (session.googleEventId) {
    try {
      await deleteCalendarEvent(session.googleEventId);
    } catch (err) {
      console.error("Calendar delete failed:", err.message);
    }
  }

  await TutoringSession.findByIdAndDelete(id);
  return;
}

export async function getAllSessions(query) {
  validation.validateFilterQuery(query);
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = utils.buildFilter(query);

  const [total, sessions] = await Promise.all([
    TutoringSession.countDocuments(filter),
    TutoringSession.find(filter)
      .populate("tutor", "fullName email role")
      .populate("participants.userId", "fullName email")
      .sort({ "schedule.date": 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return { sessions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getSessionById(id) {
  validation.validateObjectId(id);
  const session = await TutoringSession.findById(id).populate("tutor", "fullName email role").populate("participants.userId", "fullName email");
  return ensureSessionExists(session);
}

export async function joinSession(user, id) {
  validation.validateObjectId(id);
  if (!user) throw new UnauthorizedError("Authentication required");

  const session = await TutoringSession.findById(id);
  ensureSessionExists(session);

  await session.addParticipant(user.userId);

  if (session.googleEventId) {
    try {
      const updated = await TutoringSession.findById(id).populate("participants.userId", "email");
      await updateCalendarEvent(session.googleEventId, updated);
    } catch (err) {
      console.error("Failed to sync attendees:", err.message);
    }
  }

  return session.capacity.currentEnrolled;
}

export async function leaveSession(user, id) {
  validation.validateObjectId(id);
  if (!user) throw new UnauthorizedError("Authentication required");

  const session = await TutoringSession.findById(id);
  ensureSessionExists(session);

  await session.removeParticipant(user.userId);

  if (session.googleEventId) {
    try {
      const updated = await TutoringSession.findById(id).populate("participants.userId", "email");
      await updateCalendarEvent(session.googleEventId, updated);
    } catch (err) {
      console.error("Failed to sync attendees:", err.message);
    }
  }

  return session.capacity.currentEnrolled;
}

export async function getTutorSessions(tutorId) {
  validation.validateObjectId(tutorId, "tutorId");
  const sessions = await TutoringSession.find({ tutor: tutorId }).populate("tutor", "fullName email role").populate("participants.userId", "fullName email").sort({ "schedule.date": -1 });
  return sessions;
}

export async function getMyEnrolledSessions(user) {
  if (!user) throw new UnauthorizedError("Authentication required");
  const sessions = await TutoringSession.find({ "participants.userId": user.userId }).populate("tutor", "fullName email role").sort({ "schedule.date": 1 });
  return sessions;
}