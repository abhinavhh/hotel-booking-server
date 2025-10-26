import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';

const profileService = new ProfileService();

export class ProfileController {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const profile = await profileService.getProfile(userId);
      
      res.json({ profile });
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to fetch profile',
        error: error.message
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = req.body;

      const profile = await profileService.updateProfile(userId, data);
      
      res.json({ 
        profile,
        message: 'Profile updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          message: 'All password fields are required'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: 'New passwords do not match'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters'
        });
      }

      await profileService.changePassword(userId, { currentPassword, newPassword, confirmPassword });
      
      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(400).json({
        message: error.message || 'Failed to change password',
        error: error.message
      });
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const preferences = req.body;

      const profile = await profileService.updatePreferences(userId, preferences);
      
      res.json({ 
        profile,
        message: 'Preferences updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        message: 'Failed to update preferences',
        error: error.message
      });
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded'
        });
      }

      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll use the file path
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const profile = await profileService.uploadAvatar(userId, avatarUrl);
      
      res.json({ 
        profile,
        message: 'Avatar updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        message: 'Failed to upload avatar',
        error: error.message
      });
    }
  }
}