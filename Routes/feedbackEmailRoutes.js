import express from "express";
import { sendFeedbackNotification } from "../Controllers/feedbackEmailController.js";

const router = express.Router();

// POST /api/email/feedback-notify
router.post("/feedback-notify", sendFeedbackNotification);

export default router;