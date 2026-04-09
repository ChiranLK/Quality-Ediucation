/**
 * unit/tutoringSessionUtils.test.js
 * ─────────────────────────────────────────────────────────────────
 * Unit Tests — Tutoring Session Utility Functions
 *
 * Tests:  escapeRegex | buildFilter
 *
 * Isolation: No database, no HTTP — pure function testing.
 * ─────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from "@jest/globals";
import { escapeRegex, buildFilter } from "../../utils/tutoringSessionUtils.js";

// ─── 1. escapeRegex ──────────────────────────────────────────────────────────

describe("escapeRegex()", () => {
  it("✅ SUCCESS — plain string is returned unchanged", () => {
    expect(escapeRegex("mathematics")).toBe("mathematics");
  });

  it("✅ SUCCESS — escapes special regex characters", () => {
    const result = escapeRegex("c++ (advanced)");
    // . * + ? ^ $ { } ( ) | [ ] \ should all be escaped
    expect(result).toBe("c\\+\\+ \\(advanced\\)");
  });

  it("✅ SUCCESS — escapes a dot character", () => {
    expect(escapeRegex("2.0")).toBe("2\\.0");
  });

  it("❌ ERROR — handles empty string gracefully", () => {
    expect(escapeRegex("")).toBe("");
  });

  it("🔲 EDGE — converts non-string input to string before escaping", () => {
    // Should not throw — converts number to string
    expect(() => escapeRegex(123)).not.toThrow();
    expect(escapeRegex(123)).toBe("123");
  });

  it("🔲 EDGE — handles null/undefined by treating as empty string", () => {
    expect(() => escapeRegex(null)).not.toThrow();
  });
});

// ─── 2. buildFilter ──────────────────────────────────────────────────────────

describe("buildFilter()", () => {
  it("✅ SUCCESS — returns a base date filter with an empty query", () => {
    const filter = buildFilter({});
    // "schedule.date" is a literal flat key (not a nested path)
    expect(filter["schedule.date"]).toBeDefined();
    expect(filter["schedule.date"]).toHaveProperty("$gte");
    expect(filter["schedule.date"]["$gte"]).toBeInstanceOf(Date);
  });

  it("✅ SUCCESS — adds tutor filter when tutor query param is given", () => {
    const filter = buildFilter({ tutor: "tutorId123" });
    expect(filter.tutor).toBe("tutorId123");
  });

  it("✅ SUCCESS — adds subject regex filter when subject is given", () => {
    const filter = buildFilter({ subject: "physics" });
    expect(filter.subject).toHaveProperty("$regex", "physics");
    expect(filter.subject).toHaveProperty("$options", "i");
  });

  it("✅ SUCCESS — adds level filter when level is given", () => {
    const filter = buildFilter({ level: "beginner" });
    expect(filter.level).toBe("beginner");
  });

  it("✅ SUCCESS — adds status filter", () => {
    const filter = buildFilter({ status: "scheduled" });
    expect(filter.status).toBe("scheduled");
  });

  it("✅ SUCCESS — numeric grade adds both level regex and grade number", () => {
    const filter = buildFilter({ grade: "10" });
    // Should use $and at the top level to combine date + grade filters
    expect(filter).toHaveProperty("$and");
    const gradeClause = filter["$and"][1]["$or"];
    expect(gradeClause).toBeDefined();
    // One clause should be a level regex
    const levelClause = gradeClause.find((c) => c.level);
    expect(levelClause).toBeDefined();
    // Another clause should match grade: 10
    const gradeNumClause = gradeClause.find((c) => c.grade === 10);
    expect(gradeNumClause).toBeDefined();
  });

  it("✅ SUCCESS — non-numeric grade adds level regex + string grade match", () => {
    const filter = buildFilter({ grade: "intermediate" });
    expect(filter).toHaveProperty("$and");
    const gradeClause = filter["$and"][1]["$or"];
    const gradeStrClause = gradeClause.find((c) => c.grade === "intermediate");
    expect(gradeStrClause).toBeDefined();
  });

  it("❌ ERROR — does not add subject filter for empty string", () => {
    const filter = buildFilter({ subject: "" });
    expect(filter.subject).toBeUndefined();
  });

  it("🔲 EDGE — multiple query params are all applied", () => {
    const filter = buildFilter({ subject: "maths", level: "advanced", status: "scheduled" });
    expect(filter.subject).toHaveProperty("$regex");
    expect(filter.level).toBe("advanced");
    expect(filter.status).toBe("scheduled");
  });

  it("🔲 EDGE — date threshold is always >= now (not in the past)", () => {
    const before = new Date();
    const filter = buildFilter({});
    const after = new Date();
    const threshold = filter["schedule.date"]["$gte"];
    expect(threshold.getTime()).toBeGreaterThanOrEqual(before.getTime() - 100);
    expect(threshold.getTime()).toBeLessThanOrEqual(after.getTime() + 100);
  });
});
