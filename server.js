import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import emailRoutes from "./Routes/emailRoutes.js";

import connectDB from "./Config/db.js";
import { errorHandler } from "./Middleware/errorHandler.js";

// Routes
import authRouter from "./Routes/authRouter.js";
import feedbackRouter from "./Routes/feedbackRouter.js";
import progressRouter from "./Routes/progressRouter.js";
import feedbackEmailRoutes from "./Routes/feedbackEmailRoutes.js";
import messageRouter from "./Routes/messageRouter.js";
import tutoringSessionRouter from "./Routes/tutoringSessionRouter.js";
import googleCalendarRouter from "./Routes/googleCalenderRouter.js";
import googleOAuthRouter from "./Routes/googleOAuthRouter.js";
import tutorRouter from "./Routes/tutorRouter.js";
import materialRouter from "./Routes/materialRouter.js";

// Google Calendar
import { initCalendar } from "./services/googleCalendarService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files (profile pictures etc.) as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AF Backend API" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is working" });
});

app.use("/api/auth", authRouter);
app.use("/api/feedbacks", feedbackRouter);
app.use("/api/progress", progressRouter);
app.use("/api/email", emailRoutes);
app.use("/api/email", feedbackEmailRoutes);
app.use("/api/messages", messageRouter);
app.use("/api/tutoring-sessions", tutoringSessionRouter);
app.use("/api/tutors", tutorRouter);
app.use("/api/materials", materialRouter);
app.use("/api/google-oauth", googleOAuthRouter);
app.use("/api/google-calendar", googleCalendarRouter);  // ← ADD THIS LINE

// Init Google Calendar
initCalendar();

// Error Handler Middleware - MUST be last
app.use(errorHandler);

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("REFRESH TOKEN:", process.env.GOOGLE_REFRESH_TOKEN ? "Exists" : "Missing");

// Port
const PORT = process.env.PORT || 5000;

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});