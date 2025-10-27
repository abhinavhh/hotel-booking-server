import express from "express";
import { 
  createOrderHandler, 
  verifyPaymentHandler,
  razorpayWebhook 
} from "../controllers/payment.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", authMiddleware, createOrderHandler);

// Verify payment after successful transaction
router.post("/verify", authMiddleware, verifyPaymentHandler);

// Webhook endpoint (no auth required)
router.post("/webhook", razorpayWebhook);

export default router;