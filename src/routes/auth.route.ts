// routes/auth.route.ts
import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOTP);

// ✅ Protected routes
router.get("/me", authMiddleware, getProfile);
router.get("/profile", authMiddleware, getProfile); // Alias for /me

export default router;