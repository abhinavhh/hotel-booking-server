import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  hotelId: Types.ObjectId;
  roomId: string;
  hotelName: string;
  hotelImage: string;
  location: string;
  roomType: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  price: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  bookingDate: Date;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  paymentDetails?: {
    orderId?: string;
    paymentId?: string;
    paidAt?: Date;
  };
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomId: { type: String, required: true },
  hotelName: { type: String, required: true },
  hotelImage: { type: String },
  location: { type: String, required: true },
  roomType: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  bookingDate: { type: Date, default: Date.now },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Refunded'],
    default: 'Pending'
  },
  paymentDetails: {
    orderId: { type: String },
    paymentId: { type: String },
    paidAt: { type: Date }
  },
  specialRequests: { type: String },
  cancellationReason: { type: String },
  cancelledAt: { type: Date }
}, { timestamps: true });

// Indexes
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ hotelId: 1 });
BookingSchema.index({ checkIn: 1, checkOut: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);