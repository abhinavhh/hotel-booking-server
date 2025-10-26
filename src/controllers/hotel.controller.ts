import { Request, Response } from 'express';
import { HotelService } from '../services/hotel.service';

const hotelService = new HotelService();

export class HotelController {
  async searchHotels(req: Request, res: Response) {
    try {
      const filters = {
        location: req.query.location as string,
        minPrice: req.query.minPrice as string,
        maxPrice: req.query.maxPrice as string,
        rating: req.query.rating as string,
        guests: req.query.guests as string,
        sortBy: req.query.sortBy as string || 'popular'
      };

      const hotels = await hotelService.searchHotels(filters);
      
      res.json({ hotels });
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to search hotels',
        error: error.message
      });
    }
  }

  async getHotelById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const hotel = await hotelService.getHotelById(id);
      
      res.json({ hotel });
    } catch (error: any) {
      const statusCode = error.message === 'Hotel not found' ? 404 : 500;
      res.status(statusCode).json({
        message: error.message || 'Failed to fetch hotel',
        error: error.message
      });
    }
  }
}