import mongoose, { Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username?: string;
  name?: string;
  email: string;
  password: string;
  role?: 'User' | 'Admin';
  otp?: number | null;
  otpExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minLength: 3,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
      select: false, // Hidden by default (good for security)
    },
    role: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'User',
    },
    otp: {
      type: Number,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// --- Hash password before saving ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    next(err as any);
  }
});

// --- Compare password method ---
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error('Error comparing password:', err);
    return false;
  }
};

// --- Fix for ProfileService.changePassword() ---
userSchema.statics.findByIdWithPassword = function (id: string) {
  return this.findById(id).select('+password');
};

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model<IUser>('User', userSchema);
export default User;
