/**
 * testApp.js
 * Lightweight Express app for testing — no DB connection, no real Cloudinary.
 * Import this in integration tests instead of the real server.js.
 */
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "../../Middleware/errorHandler.js";

// Routes
import materialRouter from "../../Routes/materialRouter.js";
import authRouter from "../../Routes/authRouter.js";
import tutoringSessionRouter from "../../Routes/tutoringSessionRouter.js";
import messageRouter from "../../Routes/messageRouter.js";
import feedbackRouter from "../../Routes/feedbackRouter.js";
import progressRouter from "../../Routes/progressRouter.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Test-only middleware: inject a fake req.file for all requests ────────────
// This simulates Multer's file upload without hitting Cloudinary.
// The real uploadMaterial middleware is bypassed in routes by the mock.
app.use((req, _res, next) => {
  if (!req.file) {
    req.file = {
      path: "https://res.cloudinary.com/demo/raw/upload/v1/study_materials/test_file.pdf",
      originalname: "test.pdf",
      mimetype: "application/pdf",
      size: 12345,
    };
  }
  next();
});

// Health check
app.get("/health", (req, res) => res.status(200).json({ message: "Server is working" }));

// Mount routers under test
app.use("/api/auth", authRouter);
app.use("/api/materials", materialRouter);
app.use("/api/tutoring-sessions", tutoringSessionRouter);
app.use("/api/messages", messageRouter);
app.use("/api/feedbacks", feedbackRouter);
app.use("/api/progress", progressRouter);

// Centralised error handler (must be last)
app.use(errorHandler);

export default app;
