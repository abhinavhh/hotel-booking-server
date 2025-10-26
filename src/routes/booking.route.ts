import express from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const bookingController = new BookingController();

// Get all bookings for user
router.get('/', authMiddleware, bookingController.getAllBookings);

// Get specific booking
router.get('/:id', authMiddleware, bookingController.getBookingById);

// Create new booking
router.post('/', authMiddleware, bookingController.createBooking);

// Cancel booking
router.post('/:id/cancel', authMiddleware, bookingController.cancelBooking);

export default router;