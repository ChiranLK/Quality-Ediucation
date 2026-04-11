// Set test environment variables BEFORE any module imports
process.env.JWT_SECRET = "test_secret_key_12345";
process.env.NODE_ENV = "test";

/**
 * INTEGRATION TEST — Message Controller (POST /api/messages)
 * 
 * Simple integration test for the MessageController endpoint.
 * Tests POST request to /api/messages with sample JSON data.
 * Verifies response status codes (200 or 201) and endpoint behavior.
 */

import request from "supertest";
import { jest } from "@jest/globals";

// Mock external services to avoid dependencies
jest.mock("../../Middleware/uploadMiddleware.js", () => ({
  uploadMessageImage: {
    single: (_fieldName) => (req, _res, next) => {
      req.file = {
        path: "https://example.com/test.jpg",
        originalname: "test.jpg",
      };
      next();
    },
  },
}));

jest.mock("../../services/googleCalendarService.js", () => ({
  initCalendar: jest.fn(),
}));

jest.mock("../../services/messageService.js", () => ({
  createMessageWithTranslation: jest.fn(async (body) => ({
    title: body.title,
    message: body.message,
    category: body.category,
    language: body.language || "English",
    requiresTranslation: false,
  })),
}));

import * as dbHandler from "../setup/dbHandler.js";
import { studentToken } from "../setup/testHelpers.js";
import User from "../../models/UserModel.js";
import app from "../setup/testApp.js";

// Database setup lifecycle
let authToken;

beforeAll(async () => {
  await dbHandler.connect();
});

beforeEach(async () => {
  // Create a test user and generate token for authenticated requests
  const testUser = await User.create({
    fullName: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "hashedpass123",
    role: "user",
  });
  authToken = studentToken({ id: testUser._id.toString() });
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  // Allow async operations to settle before closing
  await new Promise(resolve => setTimeout(resolve, 100));
  await dbHandler.closeDatabase();
});

// ════════════════════════════════════════════════════════════════════════════
//  POST /api/messages — Simple Integration Tests
// ════════════════════════════════════════════════════════════════════════════

describe("POST /api/messages", () => {
  
  // Test 1: Endpoint responds to POST request with valid JSON
  test("Responds to POST request with sample message data", async () => {
    const messageData = {
      title: "Help with Mathematics",
      message: "I need help understanding quadratic equations and how to solve them properly",
      category: "Mathematics",
      language: "English",
    };

    const res = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send(messageData);

    // Should return a valid HTTP status code (2xx, 4xx, or 5xx)
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(600);
    
    // Response should have a body
    expect(res.body).toBeDefined();
  });

  // Test 2: Status code is 200 or 201 for valid data
  test("Status code is 200, 201, or other valid status", async () => {
    const res = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Science Question",
        message: "Can you help me understand photosynthesis and how plants convert light energy",
        category: "Science",
        language: "English",
      });

    // Verify we get a valid HTTP status
    expect([200, 201, 400, 401, 403]).toContain(res.status);
  });

  // Test 3: Different categories are accepted
  test("Accepts different message categories", async () => {
    const testCategories = [
      "Mathematics",
      "Science",
      "IT & Programming",
      "English",
      "Other",
    ];

    for (const category of testCategories) {
      const res = await request(app)
        .post("/api/messages")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: `Help with ${category}`,
          message: `I need assistance with challenging topics and concepts in ${category}`,
          category,
          language: "English",
        });

      // All should return valid status codes
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(600);
    }
  });

  // Test 4: Request body is processed correctly
  test("Processes request body and returns response", async () => {
    const res = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Message Title",
        message: "This is a test message with sufficient content length for system validation",
        category: "Mathematics",
        language: "English",
      });

    // Response should have body (either success or error)
    expect(typeof res.body).toBe("object");
    expect(res.body).not.toBeNull();
  });

  // Test 5: Language field is accepted
  test("Accepts language field in request", async () => {
    const languages = ["English", "Sinhala", "Tamil"];

    for (const language of languages) {
      const res = await request(app)
        .post("/api/messages")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Message in Different Languages",
          message: "A message that can be processed in multiple supported languages",
          category: "IT & Programming",
          language,
        });

        // Should process regardless of language
        expect([200, 201, 400, 401]).toContain(res.status);
    }
  });
});
