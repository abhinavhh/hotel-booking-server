import Hotel from '../models/hotel.model';
import Review from '../models/review.model';

export class HotelService {
  async searchHotels(filters: any) {
    const query: any = {};

    // Location filter
    if (filters.location) {
      query.$or = [
        { 'location.city': { $regex: filters.location, $options: 'i' } },
        { 'location.country': { $regex: filters.location, $options: 'i' } },
        { name: { $regex: filters.location, $options: 'i' } }
      ];
    }

    // Price filter
    if (filters.minPrice || filters.maxPrice) {
      query.pricePerNight = {};
      if (filters.minPrice) query.pricePerNight.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.pricePerNight.$lte = Number(filters.maxPrice);
    }

    // Rating filter
    if (filters.rating) {
      query.rating = { $gte: Number(filters.rating) };
    }

    // Build sort
    let sort: any = {};
    switch (filters.sortBy) {
      case 'price-low':
        sort = { pricePerNight: 1 };
        break;
      case 'price-high':
        sort = { pricePerNight: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'popular':
      default:
        sort = { reviewCount: -1, rating: -1 };
    }

    const hotels = await Hotel.find(query).sort(sort).limit(50).lean();

    return hotels.map(h => ({
      id: h._id.toString(),
      name: h.name,
      description: h.description,
      images: h.images,
      location: h.location,
      rating: h.rating,
      reviewCount: h.reviewCount,
      amenities: h.amenities,
      rooms: h.rooms.map((r: any) => ({
        id: r._id?.toString(),
        type: r.type,
        description: r.description,
        price: r.price,
        maxGuests: r.maxGuests,
        bedType: r.bedType,
        available: r.available,
        amenities: r.amenities
      })),
      pricePerNight: h.pricePerNight,
      featured: h.featured,
      cancellationPolicy: h.cancellationPolicy
    }));
  }

  async getHotelById(hotelId: string) {
    const hotel = await Hotel.findById(hotelId).lean();
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Get reviews
    const reviews = await Review.find({ hotelId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      id: hotel._id.toString(),
      name: hotel.name,
      description: hotel.description,
      images: hotel.images,
      location: hotel.location,
      rating: hotel.rating,
      reviewCount: hotel.reviewCount,
      amenities: hotel.amenities,
      rooms: hotel.rooms.map((r: any) => ({
        id: r._id?.toString(),
        type: r.type,
        description: r.description,
        price: r.price,
        maxGuests: r.maxGuests,
        bedType: r.bedType,
        available: r.available,
        amenities: r.amenities
      })),
      pricePerNight: hotel.pricePerNight,
      featured: hotel.featured,
      cancellationPolicy: hotel.cancellationPolicy,
      reviews: reviews.map(r => ({
        id: r._id.toString(),
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt
      }))
    };
  }
}