import Booking from '../models/booking.model';
import mongoose from 'mongoose';

export class DashboardService {
  async getDashboardStats(userId: string) {
    const objectId = new mongoose.Types.ObjectId(userId);

    // Get all bookings for the user
    const allBookings = await Booking.find({ userId: objectId });

    // Calculate stats
    const totalBookings = allBookings.length;
    const upcomingStays = allBookings.filter(
      b => b.status === 'Confirmed' && new Date(b.checkIn) > new Date()
    ).length;
    const cancelledBookings = allBookings.filter(b => b.status === 'Cancelled').length;
    const totalSpent = allBookings
      .filter(b => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.price, 0);

    // Get recent bookings (last 5)
    const recentBookings = await Booking.find({ userId: objectId })
      .sort({ bookingDate: -1 })
      .limit(5)
      .lean();

    return {
      stats: {
        totalBookings,
        upcomingStays,
        cancelledBookings,
        totalSpent
      },
      recentBookings: recentBookings.map(b => ({
        id: b._id.toString(),
        hotelName: b.hotelName,
        hotelImage: b.hotelImage,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        price: b.price,
        status: b.status,
        roomType: b.roomType,
        location: b.location
      }))
    };
  }
}