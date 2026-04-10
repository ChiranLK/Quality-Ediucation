/**
 * unit/tutoringSessionValidation.test.js
 * ─────────────────────────────────────────────────────────────────
 * Unit Tests — Tutoring Session Validation Functions
 *
 * Tests:  validateObjectId | validateSessionPayload |
 *         validateUpdatePayload | validateFilterQuery
 *
 * Isolation: No database, no HTTP — pure function testing.
 * ─────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from "@jest/globals";
import mongoose from "mongoose";

import {
  validateObjectId,
  validateSessionPayload,
  validateUpdatePayload,
  validateFilterQuery,
} from "../../validations/tutoringSession.validation.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build a valid session payload so individual tests can override one field */
const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7); // 1 week in the future
  return d.toISOString();
};

const validPayload = () => ({
  subject: "Mathematics",
  description: "An introduction to calculus for Grade 12 students.",
  schedule: {
    date: futureDate(),
    startTime: "09:00",
    endTime: "10:30",
  },
  capacity: { maxParticipants: 20 },
});

// ─── 1. validateObjectId ─────────────────────────────────────────────────────

describe("validateObjectId()", () => {
  it("✅ SUCCESS — accepts a valid Mongoose ObjectId", () => {
    const id = new mongoose.Types.ObjectId().toString();
    expect(() => validateObjectId(id)).not.toThrow();
  });

  it("❌ ERROR — throws BadRequestError for a random string", () => {
    expect(() => validateObjectId("not-an-id")).toThrow("Invalid id");
  });

  it("❌ ERROR — throws BadRequestError for an empty string", () => {
    expect(() => validateObjectId("")).toThrow();
  });

  it("🔲 EDGE — uses custom field name in the error message", () => {
    expect(() => validateObjectId("bad", "tutorId")).toThrow("Invalid tutorId");
  });

  it("🔲 EDGE — a 24-char hex string is treated as valid ObjectId", () => {
    const hex = "a".repeat(24);
    expect(() => validateObjectId(hex)).not.toThrow();
  });
});

// ─── 2. validateSessionPayload ───────────────────────────────────────────────

describe("validateSessionPayload()", () => {
  it("✅ SUCCESS — accepts a fully valid payload", () => {
    expect(() => validateSessionPayload(validPayload())).not.toThrow();
  });

  it("❌ ERROR — throws when subject is missing", () => {
    const p = validPayload();
    delete p.subject;
    expect(() => validateSessionPayload(p)).toThrow("subject, description and schedule are required");
  });

  it("❌ ERROR — throws when description is missing", () => {
    const p = validPayload();
    delete p.description;
    expect(() => validateSessionPayload(p)).toThrow(/required/i);
  });

  it("❌ ERROR — throws when schedule is missing", () => {
    const p = validPayload();
    delete p.schedule;
    expect(() => validateSessionPayload(p)).toThrow(/required/i);
  });

  it("❌ ERROR — throws when schedule.date is missing", () => {
    const p = validPayload();
    delete p.schedule.date;
    expect(() => validateSessionPayload(p)).toThrow(/date/i);
  });

  it("❌ ERROR — throws when startTime is missing", () => {
    const p = validPayload();
    delete p.schedule.startTime;
    expect(() => validateSessionPayload(p)).toThrow(/startTime/i);
  });

  it("❌ ERROR — throws for invalid time format (missing colon)", () => {
    const p = validPayload();
    p.schedule.startTime = "0900";
    expect(() => validateSessionPayload(p)).toThrow("Time must be in HH:MM format");
  });

  it("❌ ERROR — throws for invalid time format (letters)", () => {
    const p = validPayload();
    p.schedule.endTime = "AB:CD";
    expect(() => validateSessionPayload(p)).toThrow("Time must be in HH:MM format");
  });

  it("❌ ERROR — throws when date is in the past", () => {
    const p = validPayload();
    p.schedule.date = new Date("2020-01-01").toISOString();
    expect(() => validateSessionPayload(p)).toThrow("future date");
  });

  it("❌ ERROR — throws when capacity.maxParticipants is missing", () => {
    const p = validPayload();
    delete p.capacity;
    expect(() => validateSessionPayload(p)).toThrow(/maxParticipants/i);
  });

  it("❌ ERROR — throws when maxParticipants is 0", () => {
    const p = validPayload();
    p.capacity.maxParticipants = 0;
    expect(() => validateSessionPayload(p)).toThrow(/between 1 and 100/i);
  });

  it("❌ ERROR — throws when maxParticipants exceeds 100", () => {
    const p = validPayload();
    p.capacity.maxParticipants = 101;
    expect(() => validateSessionPayload(p)).toThrow(/between 1 and 100/i);
  });

  it("🔲 EDGE — maxParticipants of exactly 1 is valid", () => {
    const p = validPayload();
    p.capacity.maxParticipants = 1;
    expect(() => validateSessionPayload(p)).not.toThrow();
  });

  it("🔲 EDGE — maxParticipants of exactly 100 is valid", () => {
    const p = validPayload();
    p.capacity.maxParticipants = 100;
    expect(() => validateSessionPayload(p)).not.toThrow();
  });

  it("🔲 EDGE — midnight time '00:00' is a valid startTime", () => {
    const p = validPayload();
    p.schedule.startTime = "00:00";
    p.schedule.endTime = "01:00";
    expect(() => validateSessionPayload(p)).not.toThrow();
  });
});

// ─── 3. validateUpdatePayload ─────────────────────────────────────────────────

describe("validateUpdatePayload()", () => {
  it("✅ SUCCESS — does not throw for an empty update object", () => {
    expect(() => validateUpdatePayload({})).not.toThrow();
  });

  it("✅ SUCCESS — does not throw when valid times are provided", () => {
    expect(() =>
      validateUpdatePayload({
        schedule: { startTime: "14:00", endTime: "15:30" },
      })
    ).not.toThrow();
  });

  it("❌ ERROR — throws when startTime format is invalid in update", () => {
    expect(() =>
      validateUpdatePayload({
        schedule: { startTime: "25:00", endTime: "10:00" },
      })
    ).toThrow("Time must be in HH:MM format");
  });

  it("❌ ERROR — throws when endTime format is invalid in update", () => {
    expect(() =>
      validateUpdatePayload({
        schedule: { startTime: "09:00", endTime: "9:0" },
      })
    ).toThrow("Time must be in HH:MM format");
  });

  it("🔲 EDGE — updates without schedule field pass validation silently", () => {
    expect(() => validateUpdatePayload({ title: "New Title" })).not.toThrow();
  });
});

// ─── 4. validateFilterQuery ──────────────────────────────────────────────────

describe("validateFilterQuery()", () => {
  it("✅ SUCCESS — accepts an empty query object", () => {
    expect(() => validateFilterQuery({})).not.toThrow();
  });

  it("✅ SUCCESS — accepts a string grade value", () => {
    expect(() => validateFilterQuery({ grade: "10" })).not.toThrow();
  });

  it("✅ SUCCESS — accepts an integer grade value", () => {
    expect(() => validateFilterQuery({ grade: "6" })).not.toThrow();
  });

  it("🔲 EDGE — grade query with no value does not throw", () => {
    expect(() => validateFilterQuery({ subject: "physics" })).not.toThrow();
  });
});
