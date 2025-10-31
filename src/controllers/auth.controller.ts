import { Request, Response } from "express";
import User from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { generateOTP, sendOTPEmail } from "../utils/otpHelper";
import bcrypt from "bcryptjs";

// ✅ Register user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password") as unknown as {
      _id: { toString: () => string };
      username: string;
      email: string;
      role: string;
      comparePassword: (password: string) => Promise<boolean>;
    };
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get logged-in user's profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Profile fetched", 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name || user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Forgot Password - Send OTP
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({ 
        message: "If an account with that email exists, an OTP has been sent" 
      });
    }

    // Generate OTP (6 digits)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp, user.username || 'User');
      console.log(`OTP sent to ${email}: ${otp}`); // For development
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // In development, we'll still return success
      // In production, you might want to handle this differently
    }

    res.json({ 
      message: "OTP sent to your email address",
      // In development, include OTP in response (REMOVE IN PRODUCTION!)
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP exists
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP found. Please request a new one" });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpires) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one" });
    }

    // Verify OTP
    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.json({ 
      message: "OTP verified successfully",
      verified: true
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        message: "Email, OTP, and new password are required" 
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP exists
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ 
        message: "No OTP found. Please request a new one" 
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpires) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res.status(400).json({ 
        message: "OTP has expired. Please request a new one" 
      });
    }

    // Verify OTP
    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // save new password 
    user.password = newPassword;

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({ 
      message: "Password reset successfully. You can now login with your new password" 
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Resend OTP
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ 
        message: "If an account with that email exists, an OTP has been sent" 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp, user.username || 'User');
      console.log(`OTP resent to ${email}: ${otp}`);
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    res.json({ 
      message: "New OTP sent to your email address",
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};