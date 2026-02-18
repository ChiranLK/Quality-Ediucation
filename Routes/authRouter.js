import { Router } from "express";
import { register } from "../Controllers/authController.js";
import { login } from "../Controllers/authController.js";
import { logout } from "../Controllers/authController.js";
import { validateRegisterInput, validateLoginInput } from "../Middleware/ValidatorMiddleware.js";


const router = Router();

router.post("/register",validateRegisterInput, register);
router.post("/login",validateLoginInput, login);
router.post("/logout", logout);

export default router;
