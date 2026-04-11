/**
 * generate-helprequest-perf-token.js
 * ─────────────────────────────────────────────────────────────────
 * Generates valid JWT tokens for use in Artillery performance
 * tests against the Help Request (Messages) API.
 *
 * Usage:
 *   node tests/performance/generate-helprequest-perf-token.js
 *
 * Then paste the printed tokens into help-request-load-test.yml
 * under `variables.userToken` and `variables.tutorToken`.
 *
 * These tokens are valid for 2 hours and simulate different user roles.
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

// Use real user IDs from your MongoDB database
// Replace these with actual _id values from your users collection
const USER_ID = process.env.PERF_USER_ID || "64f1a2b3c4d5e6f7a8b9c0d1";
const TUTOR_ID = process.env.PERF_TUTOR_ID || "64f1a2b3c4d5e6f7a8b9c0d2";
const ADMIN_ID = process.env.PERF_ADMIN_ID || "64f1a2b3c4d5e6f7a8b9c0d3";

const userToken = jwt.sign(
  { userId: USER_ID, role: "user" },
  secret,
  { expiresIn: "2h" }
);

const tutorToken = jwt.sign(
  { userId: TUTOR_ID, role: "tutor" },
  secret,
  { expiresIn: "2h" }
);

const adminToken = jwt.sign(
  { userId: ADMIN_ID, role: "admin" },
  secret,
  { expiresIn: "2h" }
);

console.log("\n═══════════════════════════════════════════════════════");
console.log("  Artillery Performance Token Generator — Help Request API");
console.log("═══════════════════════════════════════════════════════");
console.log("\n🔑 User JWT (for CREATE/UPDATE/DELETE tests):");
console.log(userToken);
console.log("\n🔑 Tutor JWT (for VIEW tests with elevated access):");
console.log(tutorToken);
console.log("\n🔑 Admin JWT (for viewing all requests):");
console.log(adminToken);
console.log("\n📋 Copy these tokens into:");
console.log("   tests/performance/help-request-load-test.yml");
console.log("   Under: config.variables.userToken / tutorToken / adminToken\n");

// Additional debugging info
console.log("═══════════════════════════════════════════════════════");
console.log("💡 Token Information:");
console.log("   User ID:  ", USER_ID);
console.log("   Tutor ID: ", TUTOR_ID);
console.log("   Admin ID: ", ADMIN_ID);
console.log("   Expiry:   2 hours from generation");
console.log("═══════════════════════════════════════════════════════\n");
