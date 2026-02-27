import express from "express";
import { sendTestEmail } from "../controllers/emailController.js";

const router = express.Router();

// GET /api/email/test-email
router.get("/test-email", sendTestEmail);

export default router;