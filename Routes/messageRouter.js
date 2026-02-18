import { Router } from "express";
import {createMessage, getAllMessages} from "../Controllers/messageContoller.js";
import { authenticateUser, authorizePermissions } from "../Middleware/authMiddleware.js";

const router = Router();

router.post(
    "/",
     authenticateUser, 
     authorizePermissions("user"),
     createMessage);

router.get(
        "/",
         authenticateUser, 
         authorizePermissions("user", "admin", "tutor"),
         getAllMessages);

export default router;
