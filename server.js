import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./Config/db.js";
import cookieParser from "cookie-parser";
import emailRoutes from "./Routes/emailRoutes.js";

// Import Routes
import authRouter from "./Routes/authRouter.js";
import feedbackRouter from "./Routes/feedbackRouter.js";
import progressRouter from "./Routes/progressRouter.js";
import feedbackEmailRoutes from "./Routes/feedbackEmailRoutes.js";
import messageRouter from "./Routes/messageRouter.js";
import tutoringSessionRouter from "./Routes/tutoringSessionRouter.js";
import googleCalendarRouter from "./Routes/googleCalenderRouter.js";
import tutorRouter from "./Routes/tutorRouter.js";
import materialRouter from "./Routes/materialRouter.js";

// Import Error Handler
import { errorHandler } from "./Middleware/errorHandler.js";


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
app.use("/api/email", emailRoutes);
app.use("/api/email", feedbackEmailRoutes);
app.use("/api/messages", messageRouter);
app.use("/api/tutoring-sessions", tutoringSessionRouter);
app.use("/api/tutors", tutorRouter);
app.use("/api/materials", materialRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error Handler Middleware (MUST be last!)
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
