import express from 'express';
import { HotelController } from '../controllers/hotel.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const hotelController = new HotelController();

// Search hotels (public or authenticated)
router.get('/', authMiddleware, hotelController.searchHotels);

// Get specific hotel
router.get('/:id', authMiddleware, hotelController.getHotelById);

export default router;