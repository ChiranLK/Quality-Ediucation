import express from "express";
import { sendTestEmail } from "../Controllers/emailController.js";

const router = express.Router();

// GET /api/email/test-email
router.get("/test-email", sendTestEmail);

export default router;