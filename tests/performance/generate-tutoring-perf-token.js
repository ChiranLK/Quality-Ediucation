/**
 * generate-tutoring-perf-token.js
 * ─────────────────────────────────────────────────────────────────
 * Generates a valid JWT token for use in Artillery performance
 * tests against the Tutoring Sessions API.
 *
 * Usage:
 *   node tests/performance/generate-tutoring-perf-token.js
 *
 * Then paste the printed token into tutoring-session-load-test.yml
 * under `variables.authToken`.
 * ─────────────────────────────────────────────────────────────────
 */

import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("❌ JWT_SECRET not found in .env — cannot generate token.");
  process.exit(1);
}

// Use this as a real tutor ID from your MongoDB database
// Replace the string below with an actual _id from your users collection
const TUTOR_ID = process.env.PERF_TUTOR_ID || "64f1a2b3c4d5e6f7a8b9c0d1";
const STUDENT_ID = process.env.PERF_STUDENT_ID || "64f1a2b3c4d5e6f7a8b9c0d2";

const tutorToken = jwt.sign(
  { userId: TUTOR_ID, role: "tutor" },
  secret,
  { expiresIn: "2h" }
);

const studentToken = jwt.sign(
  { userId: STUDENT_ID, role: "user" },
  secret,
  { expiresIn: "2h" }
);

console.log("\n═══════════════════════════════════════════════════════");
console.log("  Artillery Performance Token Generator — Tutoring API");
console.log("═══════════════════════════════════════════════════════");
console.log("\n🔑 Tutor JWT (for CREATE/UPDATE/DELETE tests):");
console.log(tutorToken);
console.log("\n🔑 Student JWT (for JOIN/LEAVE tests):");
console.log(studentToken);
console.log("\n📋 Copy these tokens into:");
console.log("   tests/performance/tutoring-session-load-test.yml");
console.log("   Under: config.variables.tutorToken / studentToken\n");
