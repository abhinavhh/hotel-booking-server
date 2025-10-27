import { type Request, type Response, type NextFunction } from 'express';
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from './configs/db';
import authRoutes from "./routes/auth.route";
import dashboardRoutes from "./routes/dashboard.route";
import bookingRoutes from "./routes/booking.route";
import hotelRoutes from "./routes/hotel.route";
import profileRoutes from "./routes/profile.route";
import paymentRoutes from "./routes/payment.route";
import { authMiddleware } from './middlewares/authMiddleware';
import { errorHandler } from './utils/errorhandler';
import { seedHotels } from './utils/seedHotels';
import cors from "cors";
import path from 'path';
import fs from 'fs';

const app = express();

// Connect to database
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // your React dev server
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Parse JSON for all routes except webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    next(); // skip json parsing for webhook
  } else {
    express.json()(req, res, next);
  }
});

// Capture raw body for webhook
app.use("/api/payment/webhook", express.raw({ type: "*/*" }));

app.use(express.urlencoded({ extended: true }));

// Serve static files (for uploaded avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/api', authMiddleware, (req: Request, res: Response) => {
  res.json({ 
    message: 'Hotel Booking API is running',
    version: '1.0.0',
    status: 'healthy'
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/payment", paymentRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 API base URL: http://localhost:${PORT}/api`);
  
  // Seed hotels on first run (optional - remove in production)
  if (process.env.SEED_DATA === 'true') {
    await seedHotels();
  }
});

export default app;