// backend/models/Settings.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  general: {
    siteName: string;
    siteUrl?: string;
    supportEmail?: string;
    currency: string;
    timezone: string;
    language?: string;
  };
  email?: {
    provider: string;
    smtpHost?: string;
    smtpPort?: string;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail?: string;
    fromName?: string;
  };
  payment?: {
    stripeEnabled: boolean;
    stripePublicKey?: string;
    stripeSecretKey?: string;
    razorpayEnabled: boolean;
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
  };
  commission: {
    platformFee: number;
    taxRate: number;
    cancellationFee?: number;
    refundProcessingDays?: number;
  };
  notifications?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    bookingConfirmation: boolean;
    paymentReceived: boolean;
    cancellationNotice: boolean;
  };
  security?: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireSpecialChar: boolean;
    requireNumbers: boolean;
  };
}

const SettingsSchema: Schema = new Schema(
  {
    general: {
      siteName: { type: String, required: true, default: 'HotelBooking Pro' },
      siteUrl: { type: String },
      supportEmail: { type: String },
      currency: { type: String, required: true, default: 'INR' },
      timezone: { type: String, required: true, default: 'Asia/Kolkata' },
      language: { type: String, default: 'en' }
    },
    email: {
      provider: { type: String, default: 'smtp' },
      smtpHost: { type: String },
      smtpPort: { type: String },
      smtpUser: { type: String },
      smtpPassword: { type: String },
      fromEmail: { type: String },
      fromName: { type: String }
    },
    payment: {
      stripeEnabled: { type: Boolean, default: false },
      stripePublicKey: { type: String },
      stripeSecretKey: { type: String },
      razorpayEnabled: { type: Boolean, default: false },
      razorpayKeyId: { type: String },
      razorpayKeySecret: { type: String }
    },
    commission: {
      platformFee: { type: Number, required: true, default: 10 },
      taxRate: { type: Number, required: true, default: 18 },
      cancellationFee: { type: Number, default: 5 },
      refundProcessingDays: { type: Number, default: 7 }
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
      bookingConfirmation: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      cancellationNotice: { type: Boolean, default: true }
    },
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 30 },
      maxLoginAttempts: { type: Number, default: 5 },
      passwordMinLength: { type: Number, default: 8 },
      requireSpecialChar: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);