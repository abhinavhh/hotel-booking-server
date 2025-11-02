// backend/routes/admin.routes.ts
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import * as adminController from '../controllers/admin.controller';

const adminRoute = express.Router();

// All admin routes require both auth and admin role
adminRoute.use(authMiddleware, adminMiddleware);

// Dashboard
adminRoute.get('/dashboard', adminController.getDashboardStats);

// Hotels Management
adminRoute.get('/hotels', adminController.getAllHotels);
adminRoute.post('/hotels', adminController.createHotel);
adminRoute.put('/hotels/:id', adminController.updateHotel);
adminRoute.delete('/hotels/:id', adminController.deleteHotel);

// Bookings Management
adminRoute.get('/bookings', adminController.getAllBookings);
adminRoute.patch('/bookings/:id/status', adminController.updateBookingStatus);
adminRoute.delete('/bookings/:id', adminController.cancelBooking);

// Users Management
adminRoute.get('/users', adminController.getAllUsers);
adminRoute.patch('/users/:id/role', adminController.updateUserRole);
adminRoute.patch('/users/:id/status', adminController.updateUserStatus);
adminRoute.delete('/users/:id', adminController.deleteUser);

// Analytics
adminRoute.get('/analytics/revenue', adminController.getRevenueAnalytics);
adminRoute.get('/analytics/users', adminController.getUserAnalytics);
adminRoute.get('/analytics/bookings', adminController.getBookingAnalytics);
adminRoute.get('/analytics/hotels', adminController.getHotelAnalytics);

// Settings
adminRoute.get('/settings', adminController.getSettings);
adminRoute.put('/settings', adminController.updateSettings);

export default adminRoute;