import { Router } from "express";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
} from "../Controllers/googleAuthController.js";
import { asyncHandler } from "../Middleware/asyncHandler.js";

const router = Router();

// Get Google OAuth URL for sign-in/sign-up
router.get("/auth-url", asyncHandler(getGoogleAuthUrl));

// Google OAuth callback (GET - receives code from Google)
router.get("/callback", asyncHandler(handleGoogleCallback));

export default router;
