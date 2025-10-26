import Booking from '../models/booking.model';
import Hotel from '../models/hotel.model';
import Profile from '../models/profile.model';
import mongoose from 'mongoose';

export class BookingService {
  async getAllBookings(userId: string, filters?: any) {
    const objectId = new mongoose.Types.ObjectId(userId);
    const query: any = { userId: objectId };

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query.status = filters.status.charAt(0).toUpperCase() + filters.status.slice(1);
    }

    if (filters?.searchQuery) {
      query.$or = [
        { hotelName: { $regex: filters.searchQuery, $options: 'i' } },
        { location: { $regex: filters.searchQuery, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query).sort({ bookingDate: -1 }).lean();

    return bookings.map(b => ({
      id: b._id.toString(),
      hotelId: b.hotelId.toString(),
      hotelName: b.hotelName,
      hotelImage: b.hotelImage,
      location: b.location,
      roomType: b.roomType,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guests: b.guests,
      price: b.price,
      status: b.status,
      bookingDate: b.bookingDate,
      paymentStatus: b.paymentStatus,
      specialRequests: b.specialRequests
    }));
  }

  async getBookingById(bookingId: string, userId: string) {
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: new mongoose.Types.ObjectId(userId)
    }).lean();

    if (!booking) {
      throw new Error('Booking not found');
    }

    return {
      id: booking._id.toString(),
      hotelId: booking.hotelId.toString(),
      hotelName: booking.hotelName,
      hotelImage: booking.hotelImage,
      location: booking.location,
      roomType: booking.roomType,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      price: booking.price,
      status: booking.status,
      bookingDate: booking.bookingDate,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests
    };
  }

  async createBooking(userId: string, bookingData: any) {
    const hotel = await Hotel.findById(bookingData.hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const room = hotel.rooms.find((r: any) => r._id?.toString() === bookingData.roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Calculate price based on nights
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    const booking = new Booking({
      userId: new mongoose.Types.ObjectId(userId),
      hotelId: hotel._id,
      roomId: bookingData.roomId,
      hotelName: hotel.name,
      hotelImage: hotel.images[0] || '',
      location: `${hotel.location.city}, ${hotel.location.country}`,
      roomType: room.type,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      price: totalPrice,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      specialRequests: bookingData.specialRequests
    });

    await booking.save();

    // Add loyalty points
    await Profile.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $inc: { loyaltyPoints: Math.floor(totalPrice / 10) } },
      { upsert: true }
    );

    return {
      id: (booking._id as mongoose.Types.ObjectId).toString(),
      status: booking.status,
      message: 'Booking created successfully'
    };
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'Confirmed') {
      throw new Error('Only confirmed bookings can be cancelled');
    }

    // Check if cancellation is within policy (24 hours before check-in)
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      throw new Error('Cannot cancel booking within 24 hours of check-in');
    }

    booking.status = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    booking.cancelledAt = new Date();
    await booking.save();

    return {
      message: 'Booking cancelled successfully',
      refundAmount: booking.price
    };
  }
}