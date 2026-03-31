import { Router } from "express";
import { register, login, logout, checkEmail, updateProfile, createAdmin, setupInitialAdmin, getMe, getAllUsers, deleteUser } from "../Controllers/authController.js";
import { asyncHandler } from "../Middleware/asyncHandler.js";
import { protect } from "../Middleware/authMiddleware.js";
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
router.put("/profile", protect, asyncHandler(updateProfile));
router.delete("/users/:userId", protect, asyncHandler(deleteUser));
router.post("/setup-admin", protect, asyncHandler(setupInitialAdmin));
router.post("/create-admin", protect, asyncHandler(createAdmin));

export default router;