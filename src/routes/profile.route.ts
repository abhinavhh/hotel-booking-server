import express from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const profileController = new ProfileController();

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Request, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get profile
router.get('/', authMiddleware, profileController.getProfile);

// Update profile
router.put('/', authMiddleware, profileController.updateProfile);

// Change password
router.post('/change-password', authMiddleware, profileController.changePassword);

// Update preferences
router.put('/preferences', authMiddleware, profileController.updatePreferences);

// Upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), profileController.uploadAvatar);

export default router;