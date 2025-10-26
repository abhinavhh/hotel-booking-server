import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

const bookingService = new BookingService();

export class BookingController {
  async getAllBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const filters = {
        status: req.query.status as string,
        searchQuery: req.query.search as string
      };

      const bookings = await bookingService.getAllBookings(userId, filters);
      
      res.json({ bookings });
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to fetch bookings',
        error: error.message
      });
    }
  }

  async getBookingById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const booking = await bookingService.getBookingById(id, userId);
      
      res.json({ booking });
    } catch (error: any) {
      const statusCode = error.message === 'Booking not found' ? 404 : 500;
      res.status(statusCode).json({
        message: error.message || 'Failed to fetch booking',
        error: error.message
      });
    }
  }

  async createBooking(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const bookingData = req.body;

      const booking = await bookingService.createBooking(userId, bookingData);
      
      res.status(201).json({ booking });
    } catch (error: any) {
      res.status(400).json({
        message: error.message || 'Failed to create booking',
        error: error.message
      });
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const result = await bookingService.cancelBooking(id, userId);
      
      res.json(result);
    } catch (error: any) {
      const statusCode = error.message === 'Booking not found' ? 404 : 400;
      res.status(statusCode).json({
        message: error.message || 'Failed to cancel booking',
        error: error.message
      });
    }
  }
}
