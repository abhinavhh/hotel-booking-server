import { Request, Response } from "express";
import { createOrder, verifyWebhookSignature, verifyPaymentSignature } from "../services/razorpay.service";
import Booking from "../models/booking.model";

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { amountRupees, bookingId } = req.body;
    
    if (!amountRupees) {
      return res.status(400).json({ message: "amountRupees required" });
    }

    const amountInPaise = Math.round(Number(amountRupees) * 100);
    const receipt = bookingId ? `booking_${bookingId}` : `rcpt_${Date.now()}`;
    
    const order = await createOrder(amountInPaise, "INR", receipt);
    
    return res.json(order);
  } catch (err: any) {
    console.error("createOrderHandler error:", err);
    return res.status(500).json({ message: err?.message || "internal error" });
  }
};

export const verifyPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const isValid = verifyPaymentSignature(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid payment signature" 
      });
    }

    // Update booking payment status
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "Paid",
        status: "Confirmed",
        paymentDetails: {
          orderId,
          paymentId,
          paidAt: new Date()
        }
      });
    }

    return res.json({ 
      success: true,
      message: "Payment verified successfully" 
    });
  } catch (err: any) {
    console.error("verifyPaymentHandler error:", err);
    return res.status(500).json({ message: err?.message || "verification failed" });
  }
};

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    let body: string;

    if (isProduction) {
      body = req.body.toString("utf-8");
      const signature = req.headers["x-razorpay-signature"] as string;
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

      if (!signature) {
        return res.status(400).json({ message: "missing signature" });
      }

      if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        return res.status(401).json({ message: "invalid signature" });
      }
    } else {
      body = JSON.stringify(req.body);
    }

    const event = isProduction ? JSON.parse(body) : req.body;
    console.log("Webhook event received:", event.event || "test_event");

    // Handle different webhook events
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      console.log("Payment captured:", payment.id);
      
      // Update booking status
      // You can extract booking ID from order receipt
      const receipt = payment.notes?.bookingId || payment.order_id;
      if (receipt) {
        await Booking.findOneAndUpdate(
          { _id: receipt.replace('booking_', '') },
          { 
            paymentStatus: "Paid",
            status: "Confirmed"
          }
        );
      }
    }

    return res.json({ status: "ok" });
  } catch (err: any) {
    console.error("razorpayWebhook error:", err);
    return res.status(500).json({ message: err?.message || "webhook processing failed" });
  }
};