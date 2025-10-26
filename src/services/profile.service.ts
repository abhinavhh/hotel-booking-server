import Profile from '../models/profile.model';
import User from '../models/user.model'; // Assuming you have this
import Booking from '../models/booking.model';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export class ProfileService {
  async getProfile(userId: string) {
    const objectId = new mongoose.Types.ObjectId(userId);
    
    const user = await User.findById(objectId).select('-password').lean();
    if (!user) {
      throw new Error('User not found');
    }

    let profile = await Profile.findOne({ userId: objectId });
    
    // Create profile if doesn't exist
    if (!profile) {
      profile = await Profile.create({ userId: objectId });
    }

    // Get total bookings
    const totalBookings = await Booking.countDocuments({ userId: objectId });

    return {
      id: user._id.toString(),
      name: user.name || user.username,
      email: user.email,
      phone: profile.phone,
      avatar: profile.avatar,
      dateOfBirth: profile.dateOfBirth,
      address: profile.address,
      preferences: profile.preferences,
      memberSince: user.createdAt,
      totalBookings,
      loyaltyPoints: profile.loyaltyPoints
    };
  }

  async updateProfile(userId: string, data: any) {
    const objectId = new mongoose.Types.ObjectId(userId);

    // Update user name if provided
    if (data.name) {
      await User.findByIdAndUpdate(objectId, { name: data.name });
    }

    // Update or create profile
    const profile = await Profile.findOneAndUpdate(
      { userId: objectId },
      {
        $set: {
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          address: data.address
        }
      },
      { upsert: true, new: true }
    );

    return this.getProfile(userId);
  }

  async changePassword(userId: string, data: any) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(data.newPassword, salt);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async updatePreferences(userId: string, preferences: any) {
    const objectId = new mongoose.Types.ObjectId(userId);

    await Profile.findOneAndUpdate(
      { userId: objectId },
      { $set: { preferences } },
      { upsert: true }
    );

    return this.getProfile(userId);
  }

  async uploadAvatar(userId: string, avatarUrl: string) {
    const objectId = new mongoose.Types.ObjectId(userId);

    await Profile.findOneAndUpdate(
      { userId: objectId },
      { $set: { avatar: avatarUrl } },
      { upsert: true }
    );

    return this.getProfile(userId);
  }
}