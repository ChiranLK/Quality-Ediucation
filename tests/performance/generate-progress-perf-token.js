/**
 * generate-progress-perf-token.js
 * Generates a valid JWT token for load testing the Progress Tracking API
 * 
 * Usage: node tests/performance/generate-progress-perf-token.js
 * 
 * Instructions:
 * 1. Run this script to generate a token
 * 2. Copy the token output
 * 3. Replace "REPLACE_WITH_VALID_JWT_TOKEN" in progress-load-test.yml with the token
 * 4. Run: artillery run tests/performance/progress-load-test.yml
 */

import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Generate a token for a tutor user (role: "tutor")
// For progress API load tests, we use a tutor since they update progress
const generateTokenForTest = () => {
  const userId = new mongoose.Types.ObjectId().toString();
  
  const payload = {
    id: userId,
    role: "tutor", // Tutor role for updating progress
    email: "test-tutor@loadtest.com",
  };
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  return token;
};

// Generate the token
const token = generateTokenForTest();

console.log("\n════════════════════════════════════════════════════════════");
console.log("📊 Progress Tracking API Load Test Token");
console.log("════════════════════════════════════════════════════════════\n");
console.log("Token (valid for 24 hours):\n");
console.log(token);
console.log("\n");
console.log("Usage Instructions:");
console.log("1. Copy the token above");
console.log("2. Open tests/performance/progress-load-test.yml");
console.log("3. Replace 'authToken: \"REPLACE_WITH_VALID_JWT_TOKEN\"' with:");
console.log(`   authToken: \"${token}\"`);
console.log("\n4. Run the load test:");
console.log("   npm run test:perf:progress:run");
console.log("\n════════════════════════════════════════════════════════════\n");
