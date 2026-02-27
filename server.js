import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./Config/db.js";

// Routes
import authRouter from "./Routes/authRouter.js";
import feedbackRouter from "./Routes/feedbackRouter.js";
import progressRouter from "./Routes/progressRouter.js";
import materialRouter from "./Routes/materialRouter.js";
import messageRouter from "./Routes/messageRouter.js";
import tutoringSessionRouter from "./Routes/tutoringSessionRouter.js";
import googleCalendarRouter from "./Routes/googleCalenderRouter.js";

// Google Calendar
import { initCalendar } from "./services/googleCalendarService.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AF Backend API" });
});

app.use("/api/auth", authRouter);
app.use("/api/feedbacks", feedbackRouter);
app.use("/api/progress", progressRouter);
app.use("/api/materials", materialRouter);
app.use("/api/messages", messageRouter);
app.use("/api/tutoring-sessions", tutoringSessionRouter);
app.use("/api/google-calendar", googleCalendarRouter);

// Init Google Calendar
initCalendar();

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