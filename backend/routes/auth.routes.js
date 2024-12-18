import express from "express";

import { signup, login, logout, verifyEmail, forgotPassword, resetPassword, refreshToken } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCurrentUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);

router.get("/me", protectRoute, getCurrentUser);

export default router;
