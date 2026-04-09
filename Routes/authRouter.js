import { Router } from "express";
import {
  register,
  login,
  logout,
  checkEmail,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  deleteMyProfile,
  createAdmin,
  setupInitialAdmin,
  getMe,
  getAllUsers,
  deleteUser,
} from "../Controllers/authController.js";
import { asyncHandler } from "../Middleware/asyncHandler.js";
import { protect } from "../Middleware/authMiddleware.js";
import { uploadAvatarImage } from "../Middleware/uploadMiddleware.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../Middleware/ValidatorMiddleware.js";

const router = Router();

router.post("/register", validateRegisterInput, asyncHandler(register));
router.post("/login", validateLoginInput, asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.post("/check-email", asyncHandler(checkEmail));
router.get("/me", protect, asyncHandler(getMe));
router.get("/all-users", protect, asyncHandler(getAllUsers));

// Profile management
router.put("/profile", protect, asyncHandler(updateProfile));
router.put("/profile/avatar", protect, uploadAvatarImage, asyncHandler(uploadAvatar));
router.delete("/profile/avatar", protect, asyncHandler(removeAvatar));
router.delete("/profile", protect, asyncHandler(deleteMyProfile));

// Admin routes
router.delete("/users/:userId", protect, asyncHandler(deleteUser));
router.post("/setup-admin", protect, asyncHandler(setupInitialAdmin));
router.post("/create-admin", protect, asyncHandler(createAdmin));

export default router;