import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoom extends Document {
  _id: Types.ObjectId;
  type: string;
  description: string;
  price: number;
  maxGuests: number;
  bedType: string;
  available: boolean;
  amenities: string[];
}

export interface IHotel extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  images: string[];
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  rating: number;
  reviewCount: number;
  amenities: string[];
  rooms: Types.DocumentArray<IRoom>;
  pricePerNight: number;
  featured: boolean;
  cancellationPolicy: string;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  bedType: { type: String, required: true },
  available: { type: Boolean, default: true },
  amenities: [{ type: String }]
});

const HotelSchema = new Schema<IHotel>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  location: {
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  amenities: [{ type: String }],
  rooms: [RoomSchema],
  pricePerNight: { type: Number, required: true },
  featured: { type: Boolean, default: false },
  cancellationPolicy: { type: String, default: 'Free cancellation up to 24 hours before check-in' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes for better query performance
HotelSchema.index({ 'location.city': 1 });
HotelSchema.index({ pricePerNight: 1 });
HotelSchema.index({ rating: -1 });
HotelSchema.index({ featured: 1 });

export default mongoose.model<IHotel>('Hotel', HotelSchema);